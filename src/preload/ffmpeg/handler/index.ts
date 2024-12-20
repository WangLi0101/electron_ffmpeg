import { TransformType } from '#/types/index'
import { ipcMain, app, dialog } from 'electron'
import fs from 'fs'
import path, { join } from 'path'
import { ffmpegHandler } from './utils/ffmpeg'

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

  ipcMain.handle('convertImage', async (e, options) => {
    return new Promise((resolve, reject) => {
      const { filePath, outputFormat, width, height } = options
      const outputPath =
        filePath.replace(/\.[^/.]+$/, '') + `_converted_${new Date().getTime()}.${outputFormat}`
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
  ipcMain.handle('videoTransform', async (e, options) => {
    return new Promise((resolve, reject) => {
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
        ffmpegHandler(e, outputPath, args, TransformType.VIDEO).then(
          (res) => {
            resolve(res)
          },
          (error) => {
            reject({
              code: 400,
              error: error.message
            })
          }
        )
      } catch (error) {
        console.error('转换失败:', error)
        reject({
          code: 400,
          error: '转换失败，请确保已安装 ffmpeg'
        })
      }
    })
  })

  // 音频转换
  ipcMain.handle('audioTransform', async (e, options) => {
    return new Promise((resolve, reject) => {
      const { filePath, outputFormat, audioCodec: _audioCodec, quality } = options

      const outputPath =
        filePath.replace(/\.[^/.]+$/, '') + `_converted_${new Date().getTime()}.${outputFormat}`

      // 根据质量参数计算比特率
      const bitrate = Math.floor((quality / 100) * 320) + 'k'

      const args = ['-i', filePath, '-b:a', bitrate, '-progress', 'pipe:1', outputPath]

      try {
        ffmpegHandler(e, outputPath, args, TransformType.AUDIO).then(
          (res) => {
            resolve(res)
          },
          (error) => {
            reject({
              code: 400,
              error: error.message
            })
          }
        )
      } catch (error) {
        console.error('转换失败:', error)
        reject({
          code: 400,
          error: '转换失败，请确保已安装 ffmpeg'
        })
      }
    })
  })
}
