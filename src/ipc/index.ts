import { execSync } from 'child_process'
import { ipcMain, app, dialog } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import { spawn } from 'child_process'
const isDev = !app.isPackaged
// 是否是mac环境
const isMac = process.platform === 'darwin'
const ffmpegPath = isMac
  ? 'ffmpeg'
  : isDev
    ? join(__dirname, '../../resources/ffmpeg/bin/ffmpeg.exe') // 开发环境路径
    : join(process.resourcesPath, 'app.asar.unpacked/resources/ffmpeg/bin/ffmpeg.exe') // 生产环境路径

export enum TransformType {
  IMAGE = 'image',
  VIDEO = 'video'
}

// 运行ffmpeg
const ffmpegHandler = (
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
            progress: progress.toFixed(1),
            text: `处理中: ${progress.toFixed(1)}%`,
            type
          })
        }
      }
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        e.sender.send('convertProgress', {
          progress: 100,
          text: '转换完成',
          type
        })
        resolve({ success: true, outputPath })
      } else {
        resolve({ success: false, error: '转换失败' })
      }
    })

    ffmpeg.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
  })
}

// 定义IPC事件类型
interface IPCEvents {
  ping: () => void
  openFile: () => Promise<string | null>
  isWeChatRunning: () => boolean
}

export function setupIPC(): void {
  // ping 渲染进程-主进程
  ipcMain.on('ping', () => {
    console.log('pong')
  })

  // ffmpeg
  ipcMain.handle('ffmpeg', (): string => {
    const res = execSync(`${ffmpegPath} -version`)
    return res.toString()
  })

  ipcMain.handle('convertImage', async (e, args) => {
    const { sourcePath, format } = args
    try {
      const fileName = `converted_${Date.now()}.${format}`
      const outputPath = join(app.getPath('downloads'), fileName)
      const args = [
        '-i',
        sourcePath,
        '-progress',
        'pipe:1', // 输出进度信息到 stdout
        outputPath
      ]
      return ffmpegHandler(e, outputPath, args, TransformType.IMAGE)
    } catch (error) {
      console.error('转换失败:', error)
      return {
        success: false,
        error: '转换失败，请确保已安装 ffmpeg'
      }
    }
  })

  // 下载文件
  ipcMain.handle('downloadFile', async (_, args) => {
    try {
      const { filePath } = args

      // 获取原始文件名
      const originalFileName = path.basename(filePath)

      // 打开保存对话框
      const { canceled, filePath: savePath } = await dialog.showSaveDialog({
        defaultPath: originalFileName,
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'webp', 'gif'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (canceled || !savePath) {
        return { success: false, error: '取消保存' }
      }

      // 复制文件到选择的位置
      await fs.promises.copyFile(filePath, savePath)

      return { success: true }
    } catch (error) {
      return { success: false, error: '保存文件失败' }
    }
  })

  // 视频转换相关
  ipcMain.handle('videoTransform', async (e, options) => {
    const { filePath, outputFormat, quality, videoCodec, audioCodec } = options

    const outputPath =
      filePath.replace(/\.[^/.]+$/, '') + `_converted_${new Date().getTime()}.${outputFormat}`

    // 根据质量参数计算比特率
    const bitrate = Math.floor((quality / 100) * 8000) + 'k'

    const args = [
      '-i',
      filePath,
      '-c:v',
      videoCodec,
      '-c:a',
      audioCodec,
      '-b:v',
      bitrate,
      '-preset',
      'medium',
      '-progress',
      'pipe:1',
      outputPath
    ]

    try {
      return ffmpegHandler(e, outputPath, args, TransformType.VIDEO)
    } catch (error) {
      console.error('转换失败:', error)
      return {
        success: false,
        error: '转换失败，请确保已安装 ffmpeg'
      }
    }
  })
}

// 为了在渲染进程中使用，可以导出事件名称类型
export type IPCEventNames = keyof IPCEvents
