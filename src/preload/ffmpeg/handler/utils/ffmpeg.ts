import path, { join } from 'path'
import { app } from 'electron'
import { spawn } from 'child_process'

const isDev = !app.isPackaged
const isMac = process.platform === 'darwin'
const ffmpegPath = isMac
  ? 'ffmpeg'
  : isDev
    ? join(__dirname, '../../resources/ffmpeg/bin/ffmpeg.exe') // 开发环境路径
    : join(process.resourcesPath, 'app.asar.unpacked/resources/ffmpeg/bin/ffmpeg.exe') // 生产环境路

// 运行ffmpeg
export const ffmpegHandler = (
  e: Electron.IpcMainInvokeEvent,
  args: string[]
): Promise<{ isSuccess: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
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
            progress: Number(progress.toFixed(1))
          })
        }
      }
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve({ isSuccess: true, message: '转换成功' })
      } else {
        reject({ isSuccess: false, message: '转换失败' })
      }
    })

    ffmpeg.on('error', (err) => {
      reject({ isSuccess: false, message: err })
    })
  })
}

export const getOutPutPath = (filePath: string, outputFormat: string) => {
  const fileName = path.basename(filePath)
  const basePath = path.dirname(filePath)
  const outputPath = path.join(
    basePath,
    `${fileName}_converted_${new Date().getTime()}.${outputFormat}`
  )
  return outputPath
}
