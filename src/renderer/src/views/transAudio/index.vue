<template>
  <div class="flex flex-col items-center p-6 min-h-screen bg-gray-50">
    <!-- 标题 -->
    <h1 class="text-2xl font-bold mb-8 text-gray-800">音频转换</h1>

    <!-- 上传区域 -->
    <div class="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md mb-6">
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        @click="triggerFileInput"
        @drop.prevent="handleDrop"
        @dragover.prevent
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="audio/*"
          @change="handleFileSelect"
        />
        <div class="text-gray-500">
          <i class="fas fa-music text-3xl mb-4"></i>
          <p class="text-lg mb-2">点击或拖拽音频文件到这里</p>
          <p class="text-sm text-gray-400">支持的格式: MP3, WAV, AAC, FLAC, OGG等</p>
        </div>
      </div>
    </div>

    <!-- 文件信息和设置 -->
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 mb-6">
      <div v-if="selectedFile" class="flex items-center justify-between mb-6">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-700">已选择文件</h3>
          <p class="text-gray-500 mt-1">{{ selectedFile.name }}</p>
        </div>
        <button class="text-red-500 hover:text-red-700 transition-colors" @click="clearFile">
          删除
        </button>
      </div>

      <!-- 转换设置 -->
      <div class="space-y-4">
        <!-- 输出格式 -->
        <div>
          <label class="block text-gray-700 mb-2">输出格式</label>
          <select
            v-model="form.outputFormat"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
            <option value="ogg">OGG</option>
          </select>
        </div>

        <!-- 音频编码 -->
        <div v-if="false">
          <label class="block text-gray-700 mb-2">音频编码</label>
          <select
            v-model="form.audioCodec"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="libmp3lame">MP3 (LAME)</option>
            <option value="aac">AAC</option>
            <option value="flac">FLAC</option>
            <option value="libvorbis">Vorbis</option>
            <option value="pcm_s16le">PCM</option>
          </select>
        </div>

        <!-- 音质设置 -->
        <div>
          <label class="block text-gray-700 mb-2">音频质量 (比特率)</label>
          <div class="flex items-center space-x-2">
            <el-slider v-model="form.quality" />
            <span class="text-gray-500 w-16 text-right">{{ bitrate }}</span>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div v-if="progress > 0" class="w-full max-w-2xl mt-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-gray-700">转换进度</span>
            <span class="text-blue-500">{{ progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 转换按钮 -->
      <div class="flex justify-center mt-4">
        <el-button type="primary" :loading="isProcessing" @click="handleTransform">
          开始转换
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { IpcRendererEvent } from 'electron'
import { ConvertProgress } from 'ffmpeg'

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<UploadFile | null>(null)
const isProcessing = ref(false)
const progress = ref(0)

const form = reactive({
  outputFormat: 'mp3',
  audioCodec: 'libmp3lame',
  quality: 80
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    selectedFile.value = {
      name: file.name,
      raw: file
    } as UploadFile
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    selectedFile.value = {
      name: file.name,
      raw: file
    } as UploadFile
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 监听转换进度
const handleConvertProgress = (_: IpcRendererEvent, data: ConvertProgress) => {
  if (data.type !== 'audio') {
    return
  }
  const { progress: value } = data
  progress.value = Number(value)
  if (value >= 100) {
    isProcessing.value = false
    ElMessage.success('转换完成！')
  }
}

window.ffmpeg.convertProgress(handleConvertProgress)

const handleTransform = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择音频文件')
    return
  }

  try {
    isProcessing.value = true
    progress.value = 0

    const result = await window.ffmpeg.audioTransform({
      filePath: selectedFile.value.raw!.path,
      outputFormat: form.outputFormat,
      audioCodec: form.audioCodec,
      quality: form.quality
    })

    if (result.code !== 0) {
      throw new Error(result.error as string)
    }
  } catch (error) {
    ElMessage.error(error || '转换失败')
    isProcessing.value = false
  }
}

const bitrate = computed(() => {
  return Math.floor((form.quality / 100) * 320) + 'k'
})
</script>

<style lang="scss" scoped></style>
