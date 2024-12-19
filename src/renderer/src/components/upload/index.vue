<template>
  <div class="upload">
    <el-upload class="upload-demo" drag action="#" multiple :http-request="handleUpload">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { UploadRequestOptions } from 'element-plus'
interface Props {
  modelValue: File
}
interface Emits {
  (e: 'update:modelValue', value: File): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const handleUpload = (options: UploadRequestOptions) => {
  emit('update:modelValue', options.file)
}
</script>

<style lang="scss" scoped></style>
