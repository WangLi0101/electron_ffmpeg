import { ipcMain, app, dialog } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import { ffmpegHandler } from './utils/ffmpeg'

// 是否是mac环境

export enum TransformType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
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
        code: 400,
        error: '转换失败，请确保已安装 ffmpeg'
      }
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
        code: 400,
        error: '转换失败，请确保已安装 ffmpeg'
      }
    }
  })

  // 音频转换
  ipcMain.handle('audioTransform', async (e, options) => {
    const { filePath, outputFormat, audioCodec, quality } = options

    const outputPath =
      filePath.replace(/\.[^/.]+$/, '') + `_converted_${new Date().getTime()}.${outputFormat}`

    // 根据质量参数计算比特率
    const bitrate = Math.floor((quality / 100) * 320) + 'k'

    const args = ['-i', filePath, '-b:a', bitrate, '-progress', 'pipe:1', outputPath]

    try {
      return ffmpegHandler(e, outputPath, args, TransformType.AUDIO)
    } catch (error) {
      console.error('转换失败:', error)
      return {
        code: 400,
        error: '转换失败，请确保已安装 ffmpeg'
      }
    }
  })
}

// 为了在渲染进程中使用，可以导出事件名称类型
export type IPCEventNames = keyof IPCEvents
