import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import { ffmpegHandler, getOutPutPath } from './utils/ffmpeg'
import {
  AudioTransformOptions,
  ConvertImageOptions,
  M3u8Options,
  MergeVideoOptions,
  VideoTransformOptions
} from 'ffmpeg'

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

  // m3u8下载
  ipcMain.handle('m3u8', async (e, options: M3u8Options) => {
    return new Promise((resolve, reject) => {
      const { url, name, outputPath: output } = options
      const outputPath = path.join(output, `${name}.mp4`)
      const args = ['-i', url, '-c', 'copy', '-bsf:a', 'aac_adtstoasc', outputPath]
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
        console.error('下载失败:', error)
        reject({
          isSuccess: false,
          message: error,
          outputPath: ''
        })
      }
    })
  })

  // 合并视频
  ipcMain.handle('mergeVideo', async (e, options: MergeVideoOptions) => {
    return new Promise((resolve, reject) => {
      const { files, outputPath: output } = options
      const outputPath = path.join(output, `merge_${Date.now()}.mp4`)

      // 创建一个临时的文本文件来存储视频文件列表
      const tempFilePath = path.join(output, 'temp_files_list.txt')

      // 创建文件列表内容
      const fileList = files.map((file) => `file '${file}'`).join('\n')

      // 写入临时文件
      fs.writeFileSync(tempFilePath, fileList)

      const args = ['-f', 'concat', '-safe', '0', '-i', tempFilePath, '-c', 'copy', outputPath]

      ffmpegHandler(e, args).then(
        (res) => {
          // 删除临时文件
          fs.unlinkSync(tempFilePath)
          resolve({ ...res, outputPath })
        },
        (error) => {
          // 发生错误时也要删除临时文件
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
          }
          reject(error)
        }
      )
    })
  })

  // 选择文件夹
  ipcMain.handle('selectFolder', async () => {
    return new Promise((resolve) => {
      dialog
        .showOpenDialog({
          properties: ['openDirectory']
        })
        .then((result) => {
          resolve(result.filePaths[0])
        })
    })
  })
}
