<template>
  <div class="trans-audio">
    <h2 class="title">
      <IconifyIcon icon="material-symbols:audio-file" />
      <p class="ml-[10px]">Audio Conversion</p>
    </h2>
    <div class="content">
      <div class="upload">
        <Upload v-model="file" accept="audio/*" />
      </div>
      <Transition name="fade">
        <div v-if="file" class="my_file">
          <div class="left flex items-center">
            <IconifyIcon icon="material-symbols:audio-file" />
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
                    <el-option-group label="Common Audio Formats">
                      <el-option label="MP3" value="mp3" />
                      <el-option label="WAV" value="wav" />
                      <el-option label="AAC" value="aac" />
                      <el-option label="FLAC" value="flac" />
                      <el-option label="OGG" value="ogg" />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Audio Codec" prop="audioCodec">
                  <el-select v-model="form.audioCodec" placeholder="Please select">
                    <el-option label="MP3" value="libmp3lame" />
                    <el-option label="AAC" value="aac" />
                    <el-option label="FLAC" value="flac" />
                    <el-option label="Vorbis" value="libvorbis" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="Sample Rate" prop="sampleRate">
                  <el-select v-model="form.sampleRate" placeholder="Please select">
                    <el-option label="44.1 kHz" value="44100" />
                    <el-option label="48 kHz" value="48000" />
                    <el-option label="96 kHz" value="96000" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Bitrate" prop="bitrate">
                  <el-slider
                    v-model="form.bitrate"
                    :min="64"
                    :max="320"
                    :format-tooltip="formatBitrate"
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
          <audio :src="`file://${viewUrl}`" controls class="w-full" />
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
  outputFormat: 'mp3',
  audioCodec: 'libmp3lame',
  sampleRate: '44100',
  bitrate: 192
})

const rules = reactive<FormRules>({
  outputFormat: [{ required: true, message: 'Please select output format', trigger: 'change' }],
  audioCodec: [{ required: true, message: 'Please select audio codec', trigger: 'change' }],
  sampleRate: [{ required: true, message: 'Please select sample rate', trigger: 'change' }]
})

const delFile = () => {
  file.value = undefined
  progress.value = 0
}

const formatBitrate = (val: number) => {
  return val + ' kbps'
}

const viewUrl = ref('')
const handleTransform = async () => {
  if (!file.value) {
    ElMessage.warning('Please select an audio file')
    return
  }

  try {
    isProcessing.value = true
    progress.value = 0

    const res = await window.ffmpeg.audioTransform({
      filePath: file.value.path,
      outputFormat: form.outputFormat,
      audioCodec: form.audioCodec,
      sampleRate: form.sampleRate,
      bitrate: form.bitrate
    })
    ElMessage.success('Conversion successful')
    viewUrl.value = res.outputPath
    isProcessing.value = false
  } catch (error) {
    ElMessage.error('Audio conversion failed')
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

<style lang="scss" scoped></style>
