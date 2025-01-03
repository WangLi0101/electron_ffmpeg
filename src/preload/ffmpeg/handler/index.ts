import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { ffmpegHandler, getOutPutPath } from './utils/ffmpeg'
import { AudioTransformOptions, ConvertImageOptions, VideoTransformOptions } from 'ffmpeg'

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

  ipcMain.handle('convertImage', async (e, options: ConvertImageOptions) => {
    return new Promise((resolve, reject) => {
      const { filePath, outputFormat, width, height } = options
      const outputPath = getOutPutPath(filePath, outputFormat)
      const args = ['-i', filePath, '-vf', `scale=${width}:${height}`, '-c:a', 'copy', outputPath]
      ffmpegHandler(e, args).then(
        (res) => {
          resolve({ ...res, outputPath })
        },
        (error) => {
          reject({ ...error, outputPath: '' })
        }
      )
    })
  })

  // 视频转换相关
  ipcMain.handle('videoTransform', async (e, options: VideoTransformOptions) => {
    return new Promise((resolve, reject) => {
      const { filePath, outputFormat, quality, videoCodec, audioCodec } = options

      const outputPath = getOutPutPath(filePath, outputFormat)

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
        ffmpegHandler(e, args).then(
          (res) => {
            resolve({ ...res, outputPath })
          },
          (error) => {
            reject(error)
          }
        )
      } catch (error) {
        console.error('转换失败:', error)
        reject({ isSuccess: false, message: error })
      }
    })
  })

  // 音频转换
  ipcMain.handle('audioTransform', async (e, options: AudioTransformOptions) => {
    return new Promise((resolve, reject) => {
      const {
        filePath,
        outputFormat,
        audioCodec: _audioCodec,
        bitrate: _bitrate,
        sampleRate
      } = options

      const outputPath = getOutPutPath(filePath, outputFormat)

      // 根据质量参数计算比特率
      const bitrate = Math.floor((_bitrate / 100) * 320) + 'k'

      const args = [
        '-i',
        filePath,
        '-b:a',
        bitrate,
        '-ar',
        sampleRate,
        '-progress',
        'pipe:1',
        outputPath
      ]

      try {
        ffmpegHandler(e, args).then(
          (res) => {
            resolve({ ...res, outputPath })
          },
          (error) => {
            reject({
              isSuccess: false,
              message: error.message,
              outputPath: ''
            })
          }
        )
      } catch (error) {
        console.error('转换失败:', error)
        reject({
          isSuccess: false,
          message: error,
          outputPath: ''
        })
      }
    })
  })
}
