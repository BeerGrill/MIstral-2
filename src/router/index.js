import { createRouter, createWebHistory } from 'vue-router'
import Configuration_view from '@/views/Configuration_view.vue'
import Try_Skill_view from '@/views/Try_Skill_view.vue'
import Start_site_view from '@/views/Start_site_view.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/Configuration',
      name: 'Configuration',
      component: Configuration_view,
    },
    {
      path: '/Try_Skill',
      name: 'Try_Skill_view',
      component: Try_Skill_view,
    },
    {
      path: '/',
      name: 'Start_site_view',
      component: Start_site_view,
    },
  //   {
  //     path: '*',
  //     name: 'catchAll',
  //     component: Home
  //  }
  ],
})

export default router