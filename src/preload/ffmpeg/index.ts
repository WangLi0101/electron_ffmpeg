import { ipcRenderer } from 'electron'
import { FfmpegApi } from 'ffmpeg'

const map = new Map()

export const ffmpegApi: FfmpegApi = {
  convertImage: (options) => ipcRenderer.invoke('convertImage', options),

  videoTransform: (options) => ipcRenderer.invoke('videoTransform', options),

  audioTransform: (options) => ipcRenderer.invoke('audioTransform', options),

  downloadFile: (options) => ipcRenderer.invoke('downloadFile', options),

  // 主进程到渲染进程
  convertProgress: (callback) => {
    map.set('convertProgress', callback)
    ipcRenderer.addListener('convertProgress', callback)
  },
  // 移除监听
  removeConvertProgress: (type: string) => {
    const fn = map.get(type)
    if (!fn) return
    ipcRenderer.removeListener(type, fn)
  }
}
