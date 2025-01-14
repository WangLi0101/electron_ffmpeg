<template>
  <div class="play-dialog">
    <el-dialog v-model="dialogVisible" title="player" width="80%">
      <div class="dialog-content">
        <video
          :src="`file://${outputPath}`"
          controls
          class="w-full h-[400px]"
          v-if="dialogVisible"
        ></video>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  outputPath: string
  modelValue: boolean
}
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style lang="scss" scoped></style>
