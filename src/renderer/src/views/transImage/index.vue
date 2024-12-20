<template>
  <div class="trans-image">
    <h2
      class="text-xl font-bold text-[#2c4de0] mb-[10px] bg-[rgba(44,77,224,0.2)] rounded-[10px] px-[10px] py-[5px] w-fit"
    >
      <IconifyIcon icon="material-symbols:imagesmode-outline" />
      Image Conversion
    </h2>
    <div class="content">
      <div class="upload">
        <Upload v-model="file" accept="image/*" />
      </div>
      <div class="file-list" v-if="file">
        <div class="file-item">
          {{ file?.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Upload from '@renderer/components/upload/index.vue'
import { ref } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue'
const file = ref<File>()
</script>

<style lang="scss" scoped></style>
