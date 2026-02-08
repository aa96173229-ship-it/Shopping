// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue' // <--- 關鍵 1：一定要引入這個檔案

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    // --- 關鍵 2：這一段一定要有 ---
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    // ---------------------------
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    // ... 前面的 routes
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    // 👇 加入這一段 👇
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('../views/ProductView.vue')
    },
    // 👆 加入這一段 👆
    // ... 後面的 routes
  ]
})

export default router
