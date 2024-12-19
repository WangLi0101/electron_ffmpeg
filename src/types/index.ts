export enum TransformType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}
export interface ConvertProgress {
  progress: number
  type: TransformType
}
