<template>
  <div class="app">
    <div class="nav">
      <el-menu class="el-menu-demo" mode="horizontal" router default-active="/">
        <el-menu-item index="/"> 图片转换 </el-menu-item>
        <el-menu-item index="/video"> 视频转换 </el-menu-item>
      </el-menu>
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
