'use strict'

const { cp, mkdir, readFile, rm, writeFile } = require('node:fs/promises')
const { join, resolve } = require('node:path')

const root = resolve(__dirname, '..')
const stagingRoot = join(root, 'desktop-app')
const sherpaRuntimeRelativePath = join(
  'dist-desktop',
  'vendor',
  'sherpa',
  'sherpa-onnx-wasm-nodejs.js'
)
const sherpaKwsRelativePath = join('dist-desktop', 'vendor', 'sherpa', 'sherpa-onnx-kws.js')
const sherpaPathShim = `var nodePath=(()=>{const n=p=>{const a=p.startsWith('/'),s=p.endsWith('/'),r=[];for(const x of p.split('/')){if(!x||x==='.'){continue}if(x==='..'){r.length&&r[r.length-1]!=='..'?r.pop():!a&&r.push('..')}else r.push(x)}let v=r.join('/');if(a)v='/'+v;if(!v)v=a?'/':'.';if(s&&v!=='/')v+='/';return v},a=p=>p.startsWith('/'),d=p=>{const v=n(p).replace(/\\/$/,'');if(v==='/')return '/';const i=v.lastIndexOf('/');return i<0?'.':i===0?'/':v.slice(0,i)},b=p=>{const v=n(p).replace(/\\/$/,'');const i=v.lastIndexOf('/');return i<0?v:v.slice(i+1)},j=(...p)=>n(p.filter(Boolean).join('/')),v=(...p)=>{let r='';for(let i=p.length-1;i>=0&&!a(r);i--)r=p[i]+'/'+r;return n(r)},q=(f,t)=>{f=v(f).split('/').filter(Boolean),t=v(t).split('/').filter(Boolean);let i=0;for(;i<f.length&&i<t.length&&f[i]===t[i];i++);return new Array(f.length-i).fill('..').concat(t.slice(i)).join('/')||''};return{isAbsolute:a,normalize:n,dirname:d,basename:b,join:j,posix:{resolve:v,relative:q}}})()`
const sherpaRawFsGuard =
  'if(ENVIRONMENT_IS_NODE){var _wrapNodeError=function(func){return function(...args){try{return func(...args)}catch(e){if(e.code){throw new FS.ErrnoError(ERRNO_CODES[e.code])}throw e}}};var VFS={...FS};for(var _key in NODERAWFS){FS[_key]=_wrapNodeError(NODERAWFS[_key])}}'

/**
 * Electron 的 sandbox Worker 暴露只读 process 信息，但没有 CommonJS require。
 * Sherpa 的 Emscripten 运行时仅凭 process 判断 Node，会因此误入 worker_threads 分支。
 */
const patchSherpaWorkerEnvironment = async () => {
  const runtimePath = join(stagingRoot, sherpaRuntimeRelativePath)
  const source = await readFile(runtimePath, 'utf8')
  const nodeEnvironmentCheck =
    'globalThis.process?.versions?.node&&globalThis.process?.type!="renderer"'
  const patchedSource = source.split(nodeEnvironmentCheck).join('false')

  if (source.split(nodeEnvironmentCheck).length !== 3) {
    throw new Error('未找到 Sherpa Worker 环境检测代码，无法生成可用的桌面唤醒运行时')
  }

  await writeFile(runtimePath, patchedSource)
  const pathShimSource = patchedSource.replace('var nodePath=require("path");', sherpaPathShim + ';')
  if (pathShimSource === patchedSource) {
    throw new Error('未找到 Sherpa PATH 依赖，无法生成浏览器兼容运行时')
  }
  await writeFile(runtimePath, pathShimSource)
  const rawFsSource = pathShimSource.replace(
    'if(ENVIRONMENT_IS_NODE){NODEFS.staticInit()}if(!ENVIRONMENT_IS_NODE){throw new Error("NODERAWFS is currently only supported on Node.js environment.")}var _wrapNodeError=function(func){return function(...args){try{return func(...args)}catch(e){if(e.code){throw new FS.ErrnoError(ERRNO_CODES[e.code])}throw e}}};var VFS={...FS};for(var _key in NODERAWFS){FS[_key]=_wrapNodeError(NODERAWFS[_key])}',
    `if(ENVIRONMENT_IS_NODE){NODEFS.staticInit()}${sherpaRawFsGuard}`
  )
  if (rawFsSource === pathShimSource) {
    throw new Error('未找到 Sherpa NODERAWFS 环境分支，无法生成浏览器兼容运行时')
  }
  const workerSafeExportSource = rawFsSource.replace(
    'window.SherpaOnnxWasmFactory=Module',
    'globalThis.SherpaOnnxWasmFactory=Module'
  )
  if (workerSafeExportSource === rawFsSource) {
    throw new Error('未找到 Sherpa 浏览器导出代码，无法生成 Worker 兼容运行时')
  }
  const singleThreadSource = workerSafeExportSource.replace(
    'var pthreadPoolSize=4;',
    'var pthreadPoolSize=0;'
  )
  if (singleThreadSource === workerSafeExportSource) {
    throw new Error('未找到 Sherpa pthread 线程池配置')
  }
  const precompiledWasmSource = singleThreadSource.replace(
    'function instantiateSync(file,info){var module;var binary=getBinarySync(file);module=new WebAssembly.Module(binary);var instance=new WebAssembly.Instance(module,info);return[instance,module]}',
    'function instantiateSync(file,info){var module=Module["wasmModule"];if(!module){var binary=getBinarySync(file);module=new WebAssembly.Module(binary)}var instance=new WebAssembly.Instance(module,info);return[instance,module]}'
  )
  if (precompiledWasmSource === singleThreadSource) {
    throw new Error('未找到 Sherpa WASM 同步编译代码')
  }
  await writeFile(runtimePath, precompiledWasmSource)

  const kwsPath = join(stagingRoot, sherpaKwsRelativePath)
  const kwsSource = await readFile(kwsPath, 'utf8')
  const nodeExportCheck =
    "typeof process == 'object' && typeof process.versions == 'object' &&\n    typeof process.versions.node == 'string'"
  const browserSafeExportCheck = `typeof module == 'object' && ${nodeExportCheck}`

  if (!kwsSource.includes(nodeExportCheck)) {
    throw new Error('未找到 Sherpa KWS CommonJS 环境检测代码')
  }

  await writeFile(kwsPath, kwsSource.replace(nodeExportCheck, browserSafeExportCheck))
}

/**
 * 将前端构建产物和最小 Electron 运行文件复制到隔离的打包目录。
 *
 * Electron Builder 会根据 lockfile 判断包管理器。现有项目根目录的 workspace 配置不完整，
 * 因而不能直接作为 app 目录；该暂存目录没有业务依赖，也不会包含开发期 node_modules。
 */
const prepare = async () => {
  await rm(stagingRoot, { recursive: true, force: true })
  await mkdir(join(stagingRoot, 'electron'), { recursive: true })

  await Promise.all([
    cp(join(root, 'dist-desktop'), join(stagingRoot, 'dist-desktop'), { recursive: true }),
    cp(join(__dirname, 'main.cjs'), join(stagingRoot, 'electron', 'main.cjs')),
    cp(join(__dirname, 'preload.cjs'), join(stagingRoot, 'electron', 'preload.cjs')),
    cp(join(__dirname, 'staging.package.json'), join(stagingRoot, 'package.json')),
    cp(join(__dirname, 'staging.package-lock.json'), join(stagingRoot, 'package-lock.json'))
  ])

  await patchSherpaWorkerEnvironment()
}

prepare().catch((error) => {
  console.error('准备桌面端打包目录失败:', error)
  process.exitCode = 1
})
