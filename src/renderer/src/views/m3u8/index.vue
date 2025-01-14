<template>
  <div class="m3u8">
    <h2 class="title">
      <IconifyIcon icon="material-symbols:video-camera-back" />
      <p class="ml-[10px]">M3U8 Download</p>
    </h2>
    <el-input
      v-model="text"
      type="textarea"
      :rows="10"
      placeholder="---区分文件名和url,换行区分多个文件
例如：
http://a.m3u8----filea
http://b.m3u8----fileb"
    />

    <div class="mt-4 flex itemc">
      <IconifyIcon
        icon="material-symbols:folder-open"
        class="mr-[4px] mt-[3px]"
        color="var(--el-color-primary)"
      />
      <p class="mr-[4px]">{{ outputFolder }}</p>
      <el-button type="primary" @click="selectFolder" link
        >{{ outputFolder ? '更改' : '选择' }}文件夹</el-button
      >
    </div>

    <el-table :data="tableData" style="width: 100%" border class="mt-4">
      <el-table-column label="#" type="index" width="50" align="center" />
      <el-table-column prop="name" label="name" show-overflow-tooltip />
      <el-table-column prop="url" label="URL" show-overflow-tooltip />
      <el-table-column prop="status" label="status" width="140" align="center">
        <template #default="scope">
          <el-tag :type="getStatus(scope.row.status)">
            <div class="flex items-center">
              <IconifyIcon
                v-if="scope.row.status === 'downloading'"
                icon="line-md:loading-loop"
                class="mr-[4px] mt-[3px]"
                color="var(--el-color-primary)"
              />
              {{ scope.row.status }}
            </div>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="outputPath" label="operator" width="100" align="center">
        <template #default="scope">
          <div v-if="scope.row.outputPath">
            <el-tooltip :content="scope.row.outputPath" placement="top">
              <el-button @click="handlePlay(scope.row.outputPath)" type="primary" link
                >play</el-button
              >
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-4 flex justify-center">
      <el-button @click="handleM3u8" type="primary">dwonload</el-button>
    </div>
    <PlayDialog v-model="dialogVisible" :output-path="currentOutputPath" />
  </div>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'
import PlayDialog from './components/PlayDialog.vue'

const text = ref('')
type Status = 'init' | 'downloading' | 'success' | 'error'
interface TableData {
  name: string
  url: string
  status: Status
  outputPath: string
}
const tableData = ref<TableData[]>([])
const handleM3u8 = async () => {
  const arr = text.value.split('\n').filter(Boolean)
  tableData.value = arr.map((item) => {
    const [url, name] = item.split('----')
    return { url, name, status: 'init', outputPath: '' }
  })
  if (!tableData.value.length) {
    ElMessage.warning('请输入下载地址')
    return
  }
  if (!outputFolder.value) {
    ElMessage.warning('请选择文件夹')
    return
  }
  ElMessageBox.confirm(`确定要下载${tableData.value.length}个文件吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.forEach((item) => {
      item.status = 'downloading'
      window.ffmpeg
        .m3u8({ url: item.url, name: item.name, outputPath: outputFolder.value })
        .then((res) => {
          item.status = res.isSuccess ? 'success' : 'error'
          item.outputPath = res.outputPath
        })
    })
  })
}
const getStatus = (status: Status) => {
  switch (status) {
    case 'init':
      return 'info'
    case 'downloading':
      return 'primary'
    case 'success':
      return 'success'
    case 'error':
      return 'danger'
  }
}

const outputFolder = ref('')
const selectFolder = async () => {
  const res = await window.ffmpeg.selectFolder()
  outputFolder.value = res
}
const dialogVisible = ref(false)
const currentOutputPath = ref('')
const handlePlay = (outputPath: string) => {
  currentOutputPath.value = outputPath
  dialogVisible.value = true
}
</script>
