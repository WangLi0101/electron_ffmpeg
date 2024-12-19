<template>
  <div class="max-w-3xl mx-auto p-8">
    <h1 class="text-2xl text-primary font-semibold text-center mb-8">视频转换</h1>

    <el-form :model="form" label-width="120px" class="bg-white p-6 rounded-lg shadow-md">
      <el-form-item label="选择视频文件">
        <el-upload
          class="w-full"
          :auto-upload="false"
          :show-file-list="true"
          :on-change="handleFileChange"
          accept="video/*"
        >
          <el-button
            type="primary"
            class="w-full h-32 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-center justify-center group"
          >
            <span>选择视频</span>
          </el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="输出格式">
        <el-select v-model="form.outputFormat" class="w-full">
          <el-option-group label="常用视频格式">
            <el-option label="MP4" value="mp4" />
            <el-option label="MKV" value="mkv" />
            <el-option label="AVI" value="avi" />
            <el-option label="MOV" value="mov" />
            <el-option label="WMV" value="wmv" />
            <el-option label="FLV" value="flv" />
            <el-option label="WebM" value="webm" />
          </el-option-group>
          <el-option-group label="专业视频格式">
            <el-option label="MXF" value="mxf" />
            <el-option label="M2TS" value="m2ts" />
            <el-option label="TS" value="ts" />
            <el-option label="VOB" value="vob" />
          </el-option-group>
          <el-option-group label="压缩视频格式">
            <el-option label="M4V" value="m4v" />
            <el-option label="3GP" value="3gp" />
            <el-option label="OGV" value="ogv" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="视频编码">
        <el-select v-model="form.videoCodec" class="w-full">
          <el-option-group label="通用编码">
            <el-option label="H.264 (AVC)" value="h264" />
            <el-option label="H.265 (HEVC)" value="hevc" />
            <el-option label="VP9" value="vp9" />
            <el-option label="AV1" value="av1" />
          </el-option-group>
          <el-option-group label="专业编码">
            <el-option label="ProRes" value="prores" />
            <el-option label="DNxHD" value="dnxhd" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="音频编码">
        <el-select v-model="form.audioCodec" class="w-full">
          <el-option label="AAC" value="aac" />
          <el-option label="MP3" value="mp3" />
          <el-option label="AC3" value="ac3" />
          <el-option label="FLAC" value="flac" />
          <el-option label="Opus" value="opus" />
        </el-select>
      </el-form-item>

      <el-form-item label="压缩质量">
        <div class="flex items-center space-x-2 w-full">
          <el-slider
            v-model="form.quality"
            :min="1"
            :max="100"
            :format-tooltip="formatQuality"
            class="flex-1"
          />
          <span class="text-gray-500 w-16 text-right">{{ bitrate }}</span>
        </div>
      </el-form-item>
      <el-form-item>
        <div v-if="progress > 0" class="mt-6 p-4 bg-white rounded-lg shadow-md">
          <el-progress :percentage="progress" />
        </div>
      </el-form-item>
      <el-form-item class="mb-0 text-center">
        <div class="flex justify-center w-full">
          <el-button type="primary" :loading="isProcessing" @click="handleTransform">
            开始转换
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { IpcRendererEvent } from 'electron'
import { ConvertProgress } from 'ffmpeg'
const form = reactive({
  file: null as UploadFile | null,
  outputFormat: 'mp4',
  videoCodec: 'h264',
  audioCodec: 'aac',
  quality: 80
})

const isProcessing = ref(false)
const progress = ref(0)

const handleFileChange = (file: UploadFile) => {
  form.file = file
}

const formatQuality = (val: number) => {
  return `${val}%`
}

// 监听转换进度
const handleConvertProgress = (_: IpcRendererEvent, data: ConvertProgress) => {
  if (data.type !== 'video') {
    return
  }
  const { progress: value } = data
  progress.value = value
  if (value >= 100) {
    isProcessing.value = false
  }
}

window.ffmpeg.convertProgress(handleConvertProgress)

const handleTransform = async () => {
  if (!form.file) {
    ElMessage.warning('请先选择视频文件')
    return
  }

  try {
    isProcessing.value = true
    progress.value = 0

    await window.ffmpeg.videoTransform({
      filePath: form.file.raw!.path,
      outputFormat: form.outputFormat,
      videoCodec: form.videoCodec,
      audioCodec: form.audioCodec,
      quality: form.quality
    })
  } catch (error) {
    ElMessage.error('视频转换失败')
    isProcessing.value = false
  }
}

const bitrate = computed(() => {
  return Math.floor((form.quality / 100) * 8000) + 'k'
})
onUnmounted(() => {
  // 移除监听
  window.ffmpeg.removeConvertProgress()
})
</script>
