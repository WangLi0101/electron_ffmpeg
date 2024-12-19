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
    type: string
    progress: number
  }

  interface Result {
    success: boolean
    outputPath: string
    error?: string
  }

  interface FfmpegApi {
    convertImage: (options: ConvertImageOptions) => Promise<Result>
    videoTransform: (options: VideoTransformOptions) => Promise<Result>
    audioTransform: (options: AudioTransformOptions) => Promise<Result>
    downloadFile: (options: DownloadFileOptions) => Promise<Result>
    convertProgress: (callback: (_: IpcRendererEvent, data: ConvertProgress) => void) => void
    removeConvertProgress: () => void
  }
}
