'use strict'

const { spawn } = require('node:child_process')
const { join, resolve } = require('node:path')

const root = resolve(__dirname, '..')
const rendererUrl = 'http://127.0.0.1:48081/'
const viteBin = join(root, 'node_modules', 'vite', 'bin', 'vite.js')
const electronCli = join(root, 'node_modules', 'electron', 'cli.js')
let rendererProcess
let electronProcess

const terminate = () => {
  electronProcess?.kill()
  rendererProcess?.kill()
}

const waitForRenderer = async () => {
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(rendererUrl)
      if (response.ok) return
    } catch {
      // Vite 启动中的连接错误可以忽略，继续轮询。
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
  }
  throw new Error('Vite 桌面开发服务器启动超时')
}

const start = async () => {
  rendererProcess = spawn(process.execPath, [viteBin, '--mode', 'desktop', '--host', '127.0.0.1', '--port', '48081'], {
    cwd: root,
    stdio: 'inherit'
  })
  rendererProcess.once('exit', (code) => {
    if (code && !electronProcess) process.exitCode = code
  })

  try {
    await waitForRenderer()
  } catch (error) {
    console.error(error)
    terminate()
    process.exitCode = 1
    return
  }

  electronProcess = spawn(process.execPath, [electronCli, '.'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ELECTRON_RENDERER_URL: rendererUrl }
  })
  electronProcess.once('exit', (code) => {
    terminate()
    process.exitCode = code || 0
  })
}

process.on('SIGINT', terminate)
process.on('SIGTERM', terminate)
void start()
