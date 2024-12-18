import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/transImage/index.vue')
  },
  {
    path: '/video',
    component: () => import('../views/transVideo/index.vue')
  },
  {
    path: '/audio',
    component: () => import('../views/transAudio/index.vue')
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
