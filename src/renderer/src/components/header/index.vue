<template>
  <div class="bg-[#fff] rounded-[10px] flex justify-center shadow-sm header">
    <el-menu mode="horizontal" router default-active="/" :ellipsis="false">
      <el-menu-item index="/">
        <IconifyIcon icon="material-symbols:image" class="text-[16px]" />
        <span class="ml-[10px] text-[16px]">Image</span>
      </el-menu-item>
      <el-menu-item index="/video">
        <IconifyIcon icon="material-symbols:video-camera-back" />
        <span class="ml-[10px] text-[16px]">Video</span>
      </el-menu-item>
      <el-menu-item index="/audio">
        <IconifyIcon icon="material-symbols:audio-file" />
        <span class="ml-[10px] text-[16px]">Audio</span>
      </el-menu-item>
      <el-menu-item index="/m3u8">
        <IconifyIcon icon="material-symbols:video-camera-back" />
        <span class="ml-[10px] text-[16px]">M3U8</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
</script>

<style lang="scss" scoped>
.header {
  :deep(.el-menu-item) {
    font-size: 18px;
  }
}
</style>
