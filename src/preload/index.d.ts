import { ElectronAPI } from '@electron-toolkit/preload'
import { FfmpegApi } from 'ffmpeg'

declare global {
  interface Window {
    electron: ElectronAPI
    ffmpeg: FfmpegApi
    api: unknown
  }
}
