'use strict'

const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const { resolve } = require('node:path')
const { runInNewContext } = require('node:vm')

const run = async () => {
  const files = new Map()
  const directories = new Set(['/'])
  const requestedPaths = []
  let usedAsyncInstantiation = false
  const window = {
    SherpaOnnxWasmFactory: async (module) => {
      assert.equal(module.wasmBinary, undefined)
      assert.ok(module.wasmModule)
      module.calledRun = true
      module.HEAPU8 = new Uint8Array()
      module.FS_createPath = (parent, name) => {
        directories.add(`${parent === '/' ? '' : parent}/${name}`)
      }
      module.FS_createDataFile = (parent, name, bytes) => {
        files.set(`${parent === '/' ? '' : parent}/${name}`, bytes)
      }
      return module
    },
    SherpaOnnxKwsFactory: {
      createKws: (_module, config) => ({ config })
    }
  }
  const WebAssembly = {
    compile: async () => {
      usedAsyncInstantiation = true
      return {}
    }
  }
  const fetch = async (path) => {
    requestedPaths.push(path)
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => Buffer.from(path)
    }
  }
  const loaderPath = resolve(__dirname, '../public/vendor/sherpa/sherpa-onnx-browser-kws.js')
  const source = await readFile(loaderPath, 'utf8')

  runInNewContext(source, { Buffer, Uint8Array, WebAssembly, fetch, window })
  await window.SherpaOnnxWakeWordModule.createKws({
    modelConfig: {
      transducer: {
        encoder: '/models/encoder.onnx',
        decoder: '/models/decoder.onnx',
        joiner: '/models/joiner.onnx'
      },
      tokens: '/models/tokens.txt'
    }
  })

  assert.deepEqual([...directories], ['/', '/models'])
  assert.equal(usedAsyncInstantiation, true)
  assert.equal(requestedPaths[0], '/vendor/sherpa/sherpa-onnx-wasm-nodejs.wasm')
  assert.deepEqual([...files.keys()].sort(), [
    '/models/decoder.onnx',
    '/models/encoder.onnx',
    '/models/joiner.onnx',
    '/models/tokens.txt'
  ])
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
