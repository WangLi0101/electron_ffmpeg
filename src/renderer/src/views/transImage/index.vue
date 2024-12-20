<template>
  <div class="trans-image">
    <h2 class="title">
      <IconifyIcon icon="material-symbols:imagesmode-outline" />
      <p class="ml-[10px]">Image Conversion</p>
    </h2>
    <div class="content">
      <div class="upload">
        <Upload v-model="file" accept="image/*" />
      </div>
      <Transition name="fade">
        <div v-if="file" class="my_file">
          <div class="left flex items-center">
            <IconifyIcon icon="material-symbols:imagesmode-outline" />
            <p class="ml-[10px]">{{ file.name }}</p>
          </div>
          <div class="right">
            <IconifyIcon icon="material-symbols:close" class="cursor-pointer" @click="delFile" />
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="file" class="my_content">
          <h3 class="title !mb-[15px] font-bold">
            <IconifyIcon icon="material-symbols:settings" class="text-[16px]" />
            <span class="ml-[10px] text-[16px]">Seeting</span>
          </h3>
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            status-icon
          >
            <el-row :gutter="10">
              <el-col :span="24">
                <el-form-item label="outputFormat" prop="outputFormat">
                  <el-select
                    v-model="ruleForm.outputFormat"
                    placeholder="Please select"
                    style="width: 200px"
                  >
                    <el-option
                      v-for="item in typeList"
                      :key="item.type"
                      :label="item.label"
                      :value="item.type"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <div class="flex items-center">
                  <el-form-item label="scale" prop="width">
                    <el-input-number
                      v-model="ruleForm.width"
                      :controls="false"
                      @change="changeWidth"
                    />
                  </el-form-item>
                  <span class="mx-[10px] mb-[10px]">*</span>
                  <el-form-item prop="height">
                    <el-input-number
                      v-model="ruleForm.height"
                      :controls="false"
                      @change="changeHeight"
                    />
                  </el-form-item>
                  <el-checkbox v-model="keepRatio" class="ml-[10px] mb-[15px]"
                    >Keep Ratio</el-checkbox
                  >
                </div>
              </el-col>
            </el-row>
          </el-form>
          <div class="progress mt-[20px]" v-if="false">
            <el-progress :percentage="progress" />
          </div>
          <div class="flex justify-center mt-[20px]">
            <el-button type="primary" @click="transition" :loading="loading">Transition</el-button>
          </div>
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="viewUrl" class="my_content">
          <h3 class="title !mb-[15px] font-bold">
            <IconifyIcon icon="material-symbols:visibility" class="text-[16px]" />
            <span class="ml-[10px] text-[16px]">View</span>
          </h3>
          <img :src="`file://${viewUrl}`" alt="" class="w-full h-auto" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Upload from '@renderer/components/upload/index.vue'
import { reactive, ref, watch } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
const file = ref<File>()
const delFile = () => {
  file.value = void 0
}
const ruleForm = ref({
  outputFormat: 'JPG',
  // 比例
  width: 100,
  height: 100
})
const ruleFormRef = ref<FormInstance>()
const keepRatio = ref(false)
const scale = ref(1)
const rules = reactive<FormRules<typeof ruleForm>>({
  outputFormat: [{ required: true, message: 'Please select', trigger: 'blur' }]
})
const typeList = [
  { label: 'JPG', type: 'jpg' },
  { label: 'PNG', type: 'png' },
  { label: 'GIF', type: 'gif' },
  { label: 'BMP', type: 'bmp' },
  { label: 'TIFF', type: 'tiff' },
  { label: 'WEBP', type: 'webp' },
  { label: 'HEIF', type: 'heif' },
  { label: 'JPEG 2000', type: 'jp2' },
  { label: 'SVG', type: 'svg' },
  { label: 'ICO', type: 'ico' }
]

watch(file, (newVal) => {
  if (newVal) {
    progress.value = 0
    viewUrl.value = ''
    const img = new Image()
    img.src = URL.createObjectURL(newVal)
    img.onload = () => {
      ruleForm.value.width = img.width
      ruleForm.value.height = img.height
      scale.value = img.width / img.height
    }
  }
})
const changeWidth = (val: number) => {
  if (keepRatio.value) {
    ruleForm.value.height = Math.round(val * scale.value)
  }
}
const changeHeight = (val: number) => {
  if (keepRatio.value) {
    ruleForm.value.width = Math.round(val * scale.value)
  }
}

const loading = ref(false)
const progress = ref(0)
const viewUrl = ref('')
const transition = () => {
  ruleFormRef.value?.validate(async (valid) => {
    if (valid) {
      if (!file.value) return
      loading.value = true

      window.ffmpeg
        .convertImage({
          filePath: file.value.path,
          ...ruleForm.value
        })
        .then(
          (res) => {
            ElMessage.success('Conversion successful')
            viewUrl.value = res.outputPath
          },
          (error) => {
            ElMessage.error(error.message)
          }
        )
        .finally(() => {
          loading.value = false
        })
    }
  })
}
</script>
