'use strict'

const { app, BrowserWindow, ipcMain, net, protocol, session, shell } = require('electron')
const { copyFile, mkdir, readFile } = require('node:fs/promises')
const { existsSync } = require('node:fs')
const { spawn } = require('node:child_process')
const { extname, join, resolve, sep } = require('node:path')

const isDevelopment = Boolean(process.env.ELECTRON_RENDERER_URL)
const rendererRoot = isDevelopment ? null : join(app.getAppPath(), 'dist-desktop')
const apiOrigin = 'https://yishizhijian.jikeyun.net'
const appOrigin = 'app://app'
let xfyunWakeProcess = null
let xfyunWakeSender = null
let isStoppingXfyunWakeProcess = false
let xfyunWakeStopPromise = null

// Sherpa 的 Emscripten 运行时在启动时同步实例化大于 8 MB 的内置 WASM。
app.commandLine.appendSwitch('enable-features', 'WebAssemblyUnlimitedSyncCompilation')

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

/** Windows 唤醒助手通过 stdout 输出单行 JSON；页面只能收到已解析的状态和检测结果。 */
const emitXfyunWakeEvent = (event) => {
  if (!xfyunWakeSender || xfyunWakeSender.isDestroyed()) return
  xfyunWakeSender.send('xfyun-wake:event', event)
}

const getXfyunWakeRuntimePath = () => {
  return isDevelopment
    ? join(__dirname, 'native', 'xfyun-awake', 'runtime')
    : join(process.resourcesPath, 'xfyun-awake')
}

const getXfyunWakeUserDataPath = () => join(app.getPath('userData'), 'xfyun-awake')

/**
 * 生成唤醒助手运行配置。
 *
 * 内部测试包若在构建前放入 runtime/xfyun-awake.ini，则安装后自动复制到当前用户目录，
 * 用户无需手工填写；该文件被 .gitignore 排除，不能提交。正式环境仍应改为后端按设备下发授权，
 * 避免共享密钥随安装包传播。
 */
const ensureXfyunWakeConfig = async (runtimePath, userDataPath) => {
  await mkdir(userDataPath, { recursive: true })
  const configPath = join(userDataPath, 'xfyun-awake.ini')

  if (!existsSync(configPath)) {
    const packagedConfigPath = join(runtimePath, 'xfyun-awake.ini')
    const configSourcePath = existsSync(packagedConfigPath)
      ? packagedConfigPath
      : join(runtimePath, 'xfyun-awake.ini.example')
    await copyFile(configSourcePath, configPath)
  }

  return configPath
}

const stopXfyunWakeProcess = () => {
  if (!xfyunWakeProcess) return Promise.resolve()
  if (xfyunWakeStopPromise) return xfyunWakeStopPromise

  isStoppingXfyunWakeProcess = true
  const helper = xfyunWakeProcess
  xfyunWakeStopPromise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (xfyunWakeProcess === helper) helper.kill()
    }, 5000)
    helper.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
  if (helper.stdin?.writable) helper.stdin.write('stop\n')
  else helper.kill()
  return xfyunWakeStopPromise
}

/** 启动官方 AIKit C++ 助手；DLL、资源和密钥始终留在 Windows 本机进程边界内。 */
const startXfyunWakeProcess = async (sender) => {
  if (process.platform !== 'win32') {
    return { started: false, message: '讯飞 AIKit 语音唤醒仅支持 Windows 桌面端' }
  }

  if (xfyunWakeProcess) {
    xfyunWakeSender = sender
    return { started: true }
  }

  const runtimePath = getXfyunWakeRuntimePath()
  const helperPath = join(runtimePath, 'xfyun-awake.exe')
  if (!existsSync(helperPath)) {
    return { started: false, message: '讯飞语音唤醒组件未安装，请重新安装 Windows 桌面端应用' }
  }

  const userDataPath = getXfyunWakeUserDataPath()
  const configPath = await ensureXfyunWakeConfig(runtimePath, userDataPath)
  const helper = spawn(helperPath, [
    '--config', configPath,
    '--resource-dir', join(runtimePath, 'resource'),
    '--work-dir', userDataPath
  ], {
    cwd: runtimePath,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe']
  })

  xfyunWakeProcess = helper
  xfyunWakeSender = sender
  isStoppingXfyunWakeProcess = false
  let pendingOutput = ''

  helper.stdout.setEncoding('utf8')
  helper.stdout.on('data', (chunk) => {
    pendingOutput += chunk
    const lines = pendingOutput.split(/\r?\n/)
    pendingOutput = lines.pop() || ''

    lines.forEach((line) => {
      try {
        const event = JSON.parse(line)
        if (event && typeof event.type === 'string') emitXfyunWakeEvent(event)
      } catch {
        // 原生 SDK 的诊断输出不转发给页面，避免异常日志被当作唤醒事件处理。
      }
    })
  })
  helper.stderr.setEncoding('utf8')
  helper.stderr.on('data', (chunk) => console.error('讯飞唤醒助手:', chunk.trim()))
  helper.on('error', (error) => {
    emitXfyunWakeEvent({ type: 'error', message: `讯飞唤醒助手启动失败：${error.message}` })
  })
  helper.on('exit', (code) => {
    const stoppedByApp = isStoppingXfyunWakeProcess
    const sender = xfyunWakeSender
    xfyunWakeProcess = null
    xfyunWakeSender = null
    isStoppingXfyunWakeProcess = false
    xfyunWakeStopPromise = null
    if (!stoppedByApp && code !== 0 && sender && !sender.isDestroyed()) {
      sender.send('xfyun-wake:event', {
        type: 'error',
        message: `讯飞唤醒助手已退出（${code ?? '未知错误'}）`
      })
    }
  })

  return { started: true }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

/** 将桌面端同源 /admin-api 请求安全代理到既有 HTTPS 服务。 */
const proxyApiRequest = async (request, url) => {
  const target = new URL(`${url.pathname}${url.search}`, apiOrigin)
  const headers = new Headers(request.headers)

  // 这些头由 Electron 到后端的新请求重新计算，不能沿用 app:// 渲染页的值。
  headers.delete('host')
  headers.delete('origin')
  headers.delete('referer')

  const options = {
    method: request.method,
    headers,
    redirect: 'manual'
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    options.body = await request.arrayBuffer()
  }

  try {
    const response = await net.fetch(target.toString(), options)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch (error) {
    console.error('桌面端接口代理失败:', error)
    return new Response('无法连接服务，请检查网络后重试。', { status: 502 })
  }
}

/** 从安装包中的 dist-desktop 返回静态资源，并阻止路径穿越读取本机文件。 */
const serveRendererFile = async (url) => {
  const requestPath = decodeURIComponent(url.pathname)
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '')
  const filePath = resolve(rendererRoot, relativePath)

  if (filePath !== rendererRoot && !filePath.startsWith(`${rendererRoot}${sep}`)) {
    return new Response('Forbidden', { status: 403 })
  }

  if (!existsSync(filePath)) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    const content = await readFile(filePath)
    return new Response(content, {
      headers: {
        'content-type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-store',
        // Sherpa-ONNX 的桌面唤醒运行时使用 SharedArrayBuffer 和 Worker，需要跨源隔离。
        'cross-origin-opener-policy': 'same-origin',
        'cross-origin-embedder-policy': 'require-corp',
        'cross-origin-resource-policy': 'same-origin'
      }
    })
  } catch (error) {
    console.error('读取桌面端静态资源失败:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/** 注册 app:// 协议，使构建后的页面与 /admin-api 在渲染进程内保持同源。 */
const registerAppProtocol = () => {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url)
    if (url.host !== 'app') return new Response('Forbidden', { status: 403 })
    if (url.pathname === '/admin-api' || url.pathname.startsWith('/admin-api/')) {
      return proxyApiRequest(request, url)
    }
    return serveRendererFile(url)
  })
}

/** 仅在桌面应用和本地开发服务器中授予 AI 语音输入所需的麦克风权限。 */
const configurePermissions = () => {
  const isAllowedOrigin = (requestingUrl) => {
    try {
      const url = new URL(requestingUrl)
      // Chromium serializes custom-scheme origins as `null`, so compare the
      // protocol/host directly for the packaged renderer.
      return (
        (url.protocol === 'app:' && url.host === 'app') || url.origin === 'http://127.0.0.1:48081'
      )
    } catch {
      return false
    }
  }

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    return (
      permission === 'media' &&
      (isAllowedOrigin(requestingOrigin) || isAllowedOrigin(webContents?.getURL?.()))
    )
  })
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback, details) => {
      callback(permission === 'media' && isAllowedOrigin(details.requestingUrl))
    }
  )
}

const createMainWindow = async () => {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: '壹拾智检 AI 助手',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, 'preload.cjs')
    }
  })

  window.once('ready-to-show', () => window.show())
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    const allowedPrefix = isDevelopment ? 'http://127.0.0.1:48081' : appOrigin
    if (!url.startsWith(allowedPrefix)) event.preventDefault()
  })

  const startUrl = isDevelopment
    ? `${process.env.ELECTRON_RENDERER_URL}#/login`
    : `${appOrigin}/index.html#/login`
  await window.loadURL(startUrl)
}

app.whenReady().then(async () => {
  if (!isDevelopment) registerAppProtocol()
  configurePermissions()
  ipcMain.on('xfyun-wake:is-available', (event) => {
    event.returnValue = process.platform === 'win32' &&
      existsSync(join(getXfyunWakeRuntimePath(), 'xfyun-awake.exe'))
  })
  ipcMain.handle('xfyun-wake:start', (event) => startXfyunWakeProcess(event.sender))
  ipcMain.handle('xfyun-wake:stop', () => stopXfyunWakeProcess())
  await createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createMainWindow()
  })
})

app.on('window-all-closed', () => {
  stopXfyunWakeProcess()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => stopXfyunWakeProcess())
