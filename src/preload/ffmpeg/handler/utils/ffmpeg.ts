import { join } from 'path'
import { app } from 'electron'
import { spawn } from 'child_process'
import { TransformType } from '#/types/index'

const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'
const ffmpegPath = isMac
  ? 'ffmpeg'
  : isDev
    ? join(__dirname, '../../resources/ffmpeg/bin/ffmpeg.exe') // 开发环境路径
    : join(process.resourcesPath, 'app.asar.unpacked/resources/ffmpeg/bin/ffmpeg.exe') // 生产环境路径

// 运行ffmpeg
export const ffmpegHandler = (
  e: Electron.IpcMainInvokeEvent,
  outputPath: string,
  args: string[],
  type: TransformType
) => {
  return new Promise((resolve) => {
    const ffmpeg = spawn(ffmpegPath, args)
    let duration = 0
    let currentTime = 0

    ffmpeg.stderr.on('data', (data) => {
      const output = data.toString()
      // 从输出中提取视频时长信息
      const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
      if (durationMatch) {
        const [, hours, minutes, seconds, centiseconds] = durationMatch
        duration =
          parseInt(hours) * 3600 +
          parseInt(minutes) * 60 +
          parseInt(seconds) +
          parseInt(centiseconds) / 100
      }
    })

    ffmpeg.stdout.on('data', (data) => {
      const output = data.toString()

      // 从进度输出中提取当前时间
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
      if (timeMatch) {
        const [, hours, minutes, seconds, centiseconds] = timeMatch
        currentTime =
          parseInt(hours) * 3600 +
          parseInt(minutes) * 60 +
          parseInt(seconds) +
          parseInt(centiseconds) / 100
        // 只在获取到duration后才计算进度
        if (duration > 0) {
          const progress = (currentTime / duration) * 100
          e.sender.send('convertProgress', {
            progress: Number(progress.toFixed(1)),
            type
          })
        }
      }
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        e.sender.send('convertProgress', {
          progress: 100,
          type
        })
        resolve({ code: 0, outputPath })
      } else {
        resolve({ code: 200, error: '转换失败' })
      }
    })

    ffmpeg.on('error', (err) => {
      resolve({ code: 400, error: err.message })
    })
  })
}
