<template>
  <div class="flex-1 p-6 overflow-auto bg-gray-50">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <!-- 标题 -->
      <h2 class="text-2xl font-medium text-gray-800 mb-6 text-center">图片格式转换</h2>

      <!-- 上传区域 -->
      <div class="mb-6">
        <el-upload
          class="upload-demo"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          accept="image/*"
        >
          <div
            class="upload-content p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors duration-300"
          >
            <el-icon class="el-icon--upload text-3xl text-gray-400 mb-2"><upload-filled /></el-icon>
            <div class="el-upload__text">
              <span class="text-gray-600">拖拽图片到这里 或 </span>
              <em class="text-blue-500 font-normal not-italic hover:text-blue-600 cursor-pointer">
                点击上传
              </em>
            </div>
          </div>
        </el-upload>
      </div>

      <!-- 格式选择区域 -->
      <div class="mb-6 space-y-4">
        <div class="flex items-center gap-4">
          <span class="text-gray-600 min-w-[80px]">输出格式:</span>
          <el-select v-model="outputFormat" placeholder="选择输出格式" class="w-[200px]">
            <el-option
              v-for="format in supportedFormats"
              :key="format"
              :label="format.toUpperCase()"
              :value="format"
            />
          </el-select>
        </div>
      </div>

      <!-- 进度条区域 -->
      <div v-if="isConverting" class="mb-6">
        <el-progress
          :percentage="convertProgress"
          :status="convertProgress >= 100 ? 'success' : ''"
          :stroke-width="8"
        />
      </div>

      <!-- 文件信息展示 -->
      <div v-if="imageFile" class="mb-6">
        <div class="flex items-center px-3 py-2 bg-gray-50 rounded-md">
          <i class="el-icon-document text-gray-400 mr-2"></i>
          <span class="text-sm text-gray-600">{{ imageFile.name }}</span>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex items-center gap-4 justify-center">
        <el-button
          type="primary"
          :disabled="!imageFile || !outputFormat || isConverting"
          @click="convertImage"
        >
          {{ isConverting ? '转换中...' : '开始转换' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { IpcRendererEvent } from 'electron'
import { ConvertProgress } from 'ffmpeg'

const imageFile = ref<UploadFile | null>(null)
const outputFormat = ref('')
const supportedFormats = ['jpg', 'png', 'webp', 'gif']
const isConverting = ref(false)
const convertProgress = ref(0)
const convertedFilePath = ref('')

const handleFileChange = (file: UploadFile) => {
  imageFile.value = file
  convertProgress.value = 0
}

const handleConvertProgress = (_: IpcRendererEvent, data: ConvertProgress) => {
  if (data.type !== 'image') {
    return
  }
  const { progress } = data
  convertProgress.value = Math.round(progress)
}
window.ffmpeg.convertProgress(handleConvertProgress)

const convertImage = async () => {
  if (!imageFile.value || !outputFormat.value) return

  try {
    isConverting.value = true
    convertProgress.value = 0

    convertedFilePath.value = ''

    const result = await window.ffmpeg.convertImage({
      filePath: imageFile.value.raw!.path,
      outputFormat: outputFormat.value
    })

    if (result.success) {
      convertProgress.value = 100

      convertedFilePath.value = result.outputPath
      ElMessage.success('转换成功!')
    } else {
      convertProgress.value = 0

      ElMessage.error(result.error || '转换失败')
    }
  } catch (error) {
    convertProgress.value = 0

    ElMessage.error('转换过程出错')
  } finally {
    isConverting.value = false
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  background: transparent;
  border: none;

  &:hover {
    background: transparent;
  }
}

:deep(.el-progress-bar__outer) {
  background-color: #f3f4f6;
}

:deep(.el-button) {
  height: 36px;
  padding: 0 20px;
}
</style>
