<template>
  <div class="bg-[#fff] rounded-[10px] flex justify-center shadow-sm">
    <el-menu mode="horizontal" router default-active="/" :ellipsis="false">
      <el-menu-item index="/"> 图片转换 </el-menu-item>
      <el-menu-item index="/video"> 视频转换 </el-menu-item>
      <el-menu-item index="/audio"> 音频转换 </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts"></script>
