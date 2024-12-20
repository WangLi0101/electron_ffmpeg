<template>
  <div class="trans-video">
    <h2 class="title">
      <IconifyIcon icon="material-symbols:video-camera-back" />
      <p class="ml-[10px]">Video Conversion</p>
    </h2>
    <div class="content">
      <div class="upload">
        <Upload v-model="file" accept="video/*" />
      </div>
      <Transition name="fade">
        <div v-if="file" class="my_file">
          <div class="left flex items-center">
            <IconifyIcon icon="material-symbols:video-camera-back" />
            <p class="ml-[10px]">{{ file.name }}</p>
          </div>
          <div class="right">
            <IconifyIcon icon="material-symbols:close" class="cursor-pointer" @click="delFile" />
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="file" class="my_content">
          <h3 class="title !mb-[15px] font-bold">
            <IconifyIcon icon="material-symbols:settings" class="text-[16px]" />
            <span class="ml-[10px] text-[16px]">Setting</span>
          </h3>
          <el-form
            ref="ruleFormRef"
            :model="form"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            status-icon
          >
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="Output Format" prop="outputFormat">
                  <el-select v-model="form.outputFormat" placeholder="Please select">
                    <el-option-group label="Common Video Formats">
                      <el-option label="MP4" value="mp4" />
                      <el-option label="MKV" value="mkv" />
                      <el-option label="AVI" value="avi" />
                      <el-option label="MOV" value="mov" />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Video Codec" prop="videoCodec">
                  <el-select v-model="form.videoCodec" placeholder="Please select">
                    <el-option label="H.264 (AVC)" value="h264" />
                    <el-option label="H.265 (HEVC)" value="hevc" />
                    <el-option label="VP9" value="vp9" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="Audio Codec" prop="audioCodec">
                  <el-select v-model="form.audioCodec" placeholder="Please select">
                    <el-option label="AAC" value="aac" />
                    <el-option label="MP3" value="mp3" />
                    <el-option label="AC3" value="ac3" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Quality" prop="quality">
                  <el-slider
                    v-model="form.quality"
                    :min="1"
                    :max="100"
                    :format-tooltip="formatQuality"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="progress mt-[20px]">
            <el-progress :percentage="progress" />
          </div>
          <div class="flex justify-center mt-[20px]">
            <el-button type="primary" @click="handleTransform" :loading="isProcessing">
              Convert
            </el-button>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="viewUrl" class="my_content">
          <h3 class="title !mb-[15px] font-bold">
            <IconifyIcon icon="material-symbols:visibility" class="text-[16px]" />
            <span class="ml-[10px] text-[16px]">View</span>
          </h3>
          <video :src="`file://${viewUrl}`" alt="" class="w-full h-auto" controls />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Upload from '@renderer/components/upload/index.vue'
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { IpcRendererEvent } from 'electron'

const file = ref<File>()
const isProcessing = ref(false)
const progress = ref(0)
const ruleFormRef = ref<FormInstance>()

const form = reactive({
  outputFormat: 'mp4',
  videoCodec: 'h264',
  audioCodec: 'aac',
  quality: 80
})

const rules = reactive<FormRules>({
  outputFormat: [{ required: true, message: 'Please select output format', trigger: 'change' }],
  videoCodec: [{ required: true, message: 'Please select video codec', trigger: 'change' }],
  audioCodec: [{ required: true, message: 'Please select audio codec', trigger: 'change' }]
})

const delFile = () => {
  file.value = undefined
  progress.value = 0
}

const formatQuality = (val: number) => {
  return Math.floor((val / 100) * 8000) + 'k'
}

const viewUrl = ref('')
const handleTransform = async () => {
  if (!file.value) {
    ElMessage.warning('Please select a video file')
    return
  }

  try {
    isProcessing.value = true
    progress.value = 0

    const res = await window.ffmpeg.videoTransform({
      filePath: file.value.path,
      outputFormat: form.outputFormat,
      videoCodec: form.videoCodec,
      audioCodec: form.audioCodec,
      quality: form.quality
    })
    ElMessage.success('Conversion successful')
    viewUrl.value = res.outputPath
    isProcessing.value = false
  } catch (error) {
    ElMessage.error('Video conversion failed')
    isProcessing.value = false
  }
}

watch(file, (newVal) => {
  if (newVal) {
    viewUrl.value = ''
    progress.value = 0
  }
})

onMounted(() => {
  window.ffmpeg.convertProgress((_: IpcRendererEvent, data) => {
    progress.value = data.progress
  })
})

onBeforeUnmount(() => {
  window.ffmpeg.removeConvertProgress('convertProgress')
})
</script>
