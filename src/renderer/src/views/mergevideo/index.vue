<template>
  <div class="mergevideo">
    <h2 class="title">
      <IconifyIcon icon="material-symbols:video-camera-back" />
      <p class="ml-[10px]">Merge Video</p>
    </h2>
    <div class="mt-4 flex items-center">
      <input
        type="file"
        webkitdirectory
        multiple
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
      />
      <IconifyIcon
        icon="material-symbols:folder-open"
        class="mr-[4px] mt-[3px]"
        color="var(--el-color-primary)"
      />
      <span class="mr-[4px]">input folder:</span>
      <p class="mr-[4px]">{{ outputFolder }}</p>
      <el-button type="primary" @click="selectInputFolder" link
        >{{ outputFolder ? 'change' : 'select' }}folder</el-button
      >
    </div>
    <div class="mt-4 flex items-center">
      <IconifyIcon
        icon="material-symbols:folder-open"
        class="mr-[4px] mt-[3px]"
        color="var(--el-color-primary)"
      />
      <span class="mr-[4px]">output folder:</span>
      <p class="mr-[4px]">{{ outputFolder }}</p>
      <el-button type="primary" @click="selectFolder" link
        >{{ outputFolder ? 'change' : 'select' }}folder</el-button
      >
    </div>

    <el-table :data="tableData" style="width: 100%" border class="mt-4">
      <el-table-column label="#" type="index" width="50" align="center" />
      <el-table-column prop="name" label="name" show-overflow-tooltip />
      <el-table-column prop="url" label="URL" show-overflow-tooltip />
    </el-table>
    <div class="mt-4 flex justify-center">
      <el-button @click="mergeVideo" type="primary">mergeVideo</el-button>
    </div>
    <PlayDialog v-model="dialogVisible" :output-path="currentOutputPath" />
  </div>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import PlayDialog from '../m3u8/components/PlayDialog.vue'

type Status = 'init' | 'downloading' | 'success' | 'error'
interface TableData {
  name: string
  url: string
}
const tableData = ref<TableData[]>([])
const mergeVideo = async () => {
  const fileUrlArr = tableData.value.map((el) => el.url)
  if (!fileUrlArr.length) {
    ElMessage.warning('请选择文件')
    return
  }
  if (!outputFolder.value) {
    ElMessage.warning('请选择文件夹')
    return
  }
  const res = await window.ffmpeg.mergeVideo({ files: fileUrlArr, outputPath: outputFolder.value })
  if (res.isSuccess) {
    ElMessage.success('合并成功')
  } else {
    ElMessage.error('合并失败')
  }
}

const outputFolder = ref('')
const selectFolder = async () => {
  const res = await window.ffmpeg.selectFolder()
  outputFolder.value = res
}
const fileInput = ref<HTMLInputElement>()
const selectInputFolder = async () => {
  fileInput.value?.click()
}
const handleFileChange = (event: Event) => {
  let files = (event.target as HTMLInputElement).files
  // 去除隐藏文件
  if (!files) return
  const filesArr = Array.from(files)
    .filter((file) => !file.name.startsWith('.'))
    .sort((a, b) => a.lastModified - b.lastModified)
  tableData.value = filesArr.map((file) => ({
    name: file.name,
    url: file.path
  }))
}
const dialogVisible = ref(false)
const currentOutputPath = ref('')
const handlePlay = (outputPath: string) => {
  currentOutputPath.value = outputPath
  dialogVisible.value = true
}
</script>
