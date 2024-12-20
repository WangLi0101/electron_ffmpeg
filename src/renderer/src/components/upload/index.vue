<template>
  <div >
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :accept="accept"
      :http-request="handleUpload"
      :show-file-list="false"
    >
    <div class="flex items-center justify-center flex-col">
      <div id="upload" style="width: 160px"></div>
      <div class="el-upload__text text-base">Drop file here or <em>click to upload</em></div>
    </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { UploadRequestOptions } from 'element-plus'
import lottie from 'lottie-web'
import file from '@renderer/assets/lottiefiles/file.json'
import { onBeforeUnmount, onMounted } from 'vue'
interface Props {
  modelValue: File | undefined
  accept: string
}
interface Emits {
  (e: 'update:modelValue', value: File): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
  let animation: any = null
  onMounted(() => {
  animation = lottie.loadAnimation({
    container: document.getElementById('upload')!, // 绑定dom节点
    renderer: 'svg', // 渲染方式:svg、canvas
    loop: true, // 是否循环播放，默认：false
    autoplay: true, // 是否自动播放, 默认true
    animationData: file // AE动画使用bodymovie导出为json数据
  })
})

const handleUpload = (options: UploadRequestOptions) => {
  emit('update:modelValue', options.file)
  return Promise.resolve()
}

onBeforeUnmount(() => {
  if (animation) {
    animation.destroy()
    animation = null
  }
})
</script>

<style lang="scss" scoped>
.upload-demo {
  :deep(.el-upload-dragger) {
    border-width: 2px;
    border-color: var(--border-color);
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
  :deep(.el-upload-dragger) {
    padding-top: 0;
  }
}
</style>
