'use strict'

const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const { resolve } = require('node:path')

const run = async () => {
  const runtimePath = resolve(
    __dirname,
    '../desktop-app/dist-desktop/vendor/sherpa/sherpa-onnx-wasm-nodejs.js'
  )
  const source = await readFile(runtimePath, 'utf8')
  const nodeCheck = 'globalThis.process?.versions?.node&&globalThis.process?.type!="renderer"'

  assert.equal(source.includes(nodeCheck), false)
  assert.match(source, /var ENVIRONMENT_IS_NODE=false/)
  assert.match(source, /var isNode=false/)
  assert.equal(source.includes('var nodePath=require("path")'), false)
  assert.equal(source.includes('NODERAWFS is currently only supported on Node.js environment.'), false)
  assert.match(source, /if\(ENVIRONMENT_IS_NODE\)\{var _wrapNodeError=/)
  assert.equal(source.includes('window.SherpaOnnxWasmFactory=Module'), false)
  assert.match(source, /globalThis\.SherpaOnnxWasmFactory=Module/)
  assert.match(source, /var pthreadPoolSize=0;/)
  assert.match(source, /var module=Module\["wasmModule"\]/)

  const kwsPath = resolve(__dirname, '../desktop-app/dist-desktop/vendor/sherpa/sherpa-onnx-kws.js')
  const kwsSource = await readFile(kwsPath, 'utf8')
  assert.match(kwsSource, /typeof module == 'object' && typeof process == 'object'/)
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
