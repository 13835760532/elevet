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
    const wasmBinaryPromise = fetch('/vendor/sherpa/sherpa-onnx-wasm-nodejs.wasm', {
      credentials: 'same-origin'
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`加载唤醒运行时失败（HTTP ${response.status}）`)
      }
      return response.arrayBuffer()
    })
    const runtimePromise = wasmBinaryPromise
      .then((wasmBinary) => WebAssembly.compile(wasmBinary))
      .then((compiledWasm) => {
        wasmModule.wasmModule = compiledWasm
        return require('./sherpa-onnx-wasm-nodejs.js')(wasmModule)
      })
    const sherpaOnnxKws = require('./sherpa-onnx-kws.js')
    const loadedFiles = new Set()

    async function ensureRuntimeReady() {
      await runtimePromise

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

    const loadModelFile = async (filePath) => {
      if (!filePath || loadedFiles.has(filePath)) return

      const response = await fetch(filePath, { credentials: 'same-origin' })
      if (!response.ok) {
        throw new Error(`加载唤醒模型文件失败：${filePath}（HTTP ${response.status}）`)
      }

      const bytes = new Uint8Array(await response.arrayBuffer())
      const normalizedPath = filePath.replace(/^\/+/, '').replace(/^\.\//, '')
      const parts = normalizedPath.split('/').filter(Boolean)
      const fileName = parts.pop()
      if (!fileName) throw new Error(`唤醒模型文件路径无效：${filePath}`)

      let parentPath = '/'
      for (const part of parts) {
        try {
          wasmModule.FS_createPath(parentPath, part, true, true)
        } catch (error) {
          if (!String(error).includes('File exists')) throw error
        }
        parentPath = `${parentPath === '/' ? '' : parentPath}/${part}`
      }

      wasmModule.FS_createDataFile(parentPath, fileName, bytes, true, true)
      loadedFiles.add(filePath)
    }

    async function ensureModelFiles(config) {
      const modelConfig = config?.modelConfig || {}
      const transducer = modelConfig.transducer || {}
      await Promise.all([
        loadModelFile(transducer.encoder),
        loadModelFile(transducer.decoder),
        loadModelFile(transducer.joiner),
        loadModelFile(modelConfig.tokens)
      ])
    }

    async function createKws(config) {
      await ensureRuntimeReady()
      await ensureModelFiles(config)
      return sherpaOnnxKws.createKws(wasmModule, config)
    }

    module.exports = {
      createKws
    }
  })()

  window.SherpaOnnxWakeWordModule = module.exports
})()
