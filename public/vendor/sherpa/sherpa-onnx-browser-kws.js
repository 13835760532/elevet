(function () {
  if (window.SherpaOnnxWakeWordModule) return

  const require = (path) => {
    switch (path) {
      case './sherpa-onnx-wasm-nodejs.js':
        return window.SherpaOnnxWasmFactory
      case './sherpa-onnx-kws.js':
        return window.SherpaOnnxKwsFactory
      default:
        throw new Error(`Unsupported sherpa dependency: ${path}`)
    }
  }

  const module = { exports: {} }
  const exports = module.exports
  void exports

  ;(function () {
    const wasmModule = {}
    const maybePromise = require('./sherpa-onnx-wasm-nodejs.js')(wasmModule)
    const sherpaOnnxKws = require('./sherpa-onnx-kws.js')

    async function ensureRuntimeReady() {
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise
      }

      if (wasmModule.calledRun || wasmModule.HEAPU8) {
        return
      }

      await new Promise((resolve) => {
        const previous = wasmModule.onRuntimeInitialized
        wasmModule.onRuntimeInitialized = () => {
          previous?.()
          resolve()
        }
      })
    }

    async function createKws(config) {
      await ensureRuntimeReady()
      return sherpaOnnxKws.createKws(wasmModule, config)
    }

    module.exports = {
      createKws
    }
  })()

  window.SherpaOnnxWakeWordModule = module.exports
})()
