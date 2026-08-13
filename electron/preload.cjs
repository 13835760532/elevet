'use strict'

const { contextBridge, ipcRenderer } = require('electron')

// 渲染进程不暴露 Node 或 Electron 对象，仅提供只读运行环境信息。
contextBridge.exposeInMainWorld('desktopApp', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome
  },
  // 仅暴露有限的唤醒控制接口，不向页面公开 IPC、文件系统或讯飞配置。
  wakeWord: {
    isSupported: () => process.platform === 'win32' && ipcRenderer.sendSync('xfyun-wake:is-available'),
    start: () => ipcRenderer.invoke('xfyun-wake:start'),
    stop: () => ipcRenderer.invoke('xfyun-wake:stop'),
    onEvent: (listener) => {
      const handler = (_event, payload) => listener(payload)
      ipcRenderer.on('xfyun-wake:event', handler)
      return () => ipcRenderer.removeListener('xfyun-wake:event', handler)
    }
  }
})
