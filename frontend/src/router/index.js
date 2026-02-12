import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'
import { useAuthStore } from '../stores/auth' // 引入 Auth

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/product/:id',
      name: 'product',
      component: ProductView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      // 👇👇👇 重點：進入這個頁面之前要檢查 👇👇👇
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.token) {
          next(); // 有登入，放行
        } else {
          alert('請先登入查看購物車');
          next('/login'); // 沒登入，踢去登入頁
        }
      }
      // 👆👆👆 檢查結束 👆👆👆
    }
  ]
})

export default router
