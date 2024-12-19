<template>
  <div class="app w-full h-screen bg-[var(--bg)] p-[20px] flex flex-col">
    <Header />
    <div class="content bg-[var(--bg-primary)] rounded-[10px] p-[20px] flex-1 mt-5">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@renderer/components/header/index.vue'
</script>
