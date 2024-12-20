<template>
  <div class="app w-full h-screen bg-[#f9f6f6] p-[10px] flex flex-col">
    <Header />
    <div class="flex-1 mt-[10px] bg-[#fff] rounded-[10px] p-[10px] shadow-sm">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@renderer/components/header/index.vue'
</script>
