declare module 'ffmpeg' {
  interface VideoTransformOptions {
    filePath: string
    outputFormat: string
    quality: number
    videoCodec: string
    audioCodec: string
  }

  interface ConvertImageOptions {
    filePath: string
    outputFormat: string
  }

  interface DownloadFileOptions {
    url: string
  }

  interface AudioTransformOptions {
    filePath: string
    outputFormat: string
    audioCodec: string
    quality: number
  }

  interface ConvertProgress {
    progress: number
  }

  interface Result {
    isSuccess: boolean
    outputPath: string
    message: string
  }

  // @ts-ignore
  type Callback = (_: IpcRendererEvent, ...args: any[]) => void
  type Key = 'convertProgress'

  interface FfmpegApi {
    convertImage: (options: ConvertImageOptions) => Promise<Result>
    videoTransform: (options: VideoTransformOptions) => Promise<Result>
    audioTransform: (options: AudioTransformOptions) => Promise<Result>
    downloadFile: (options: DownloadFileOptions) => Promise
    convertProgress: (callback: (_: IpcRendererEvent, data: ConvertProgress) => void) => void
    removeConvertProgress: (type: Key) => void
  }
}
