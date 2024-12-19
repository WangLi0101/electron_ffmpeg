import { ipcRenderer } from 'electron'
import { FfmpegApi } from 'ffmpeg'

export const ffmpegApi: FfmpegApi = {
  convertImage: (options) => ipcRenderer.invoke('convertImage', options),

  videoTransform: (options) => ipcRenderer.invoke('videoTransform', options),

  audioTransform: (options) => ipcRenderer.invoke('audioTransform', options),

  downloadFile: (options) => ipcRenderer.invoke('downloadFile', options),

  // 主进程到渲染进程
  convertProgress: (callback) => {
    ipcRenderer.on('convertProgress', callback)
  },
  // 移除监听
  removeConvertProgress: () => {
    ipcRenderer.removeListener('convertProgress', () => {})
  }
}
