import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '../pages/GamePage.vue'
import LandingPage from '../pages/LandingPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: LandingPage },
    { path: '/game', name: 'game', component: GamePage },
  ],
})

export default router
