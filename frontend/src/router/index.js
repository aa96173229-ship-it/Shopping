import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'
import OrderView from '../views/OrderView.vue' // 👈 1. 新增：引入訂單頁面
import { useAuthStore } from '../stores/auth'

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
      // 購物車保護機制
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.token) {
          next();
        } else {
          alert('請先登入查看購物車');
          next('/login');
        }
      }
    },
    // 👇👇👇 2. 新增：歷史訂單路由 (一樣要保護) 👇👇👇
    {
      path: '/orders',
      name: 'orders',
      component: OrderView,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.token) {
          next(); // 有登入，放行
        } else {
          alert('請先登入查看訂單');
          next('/login'); // 沒登入，踢去登入頁
        }
      }
    }
    // 👆👆👆 新增結束 👆👆👆
  ]
})

export default router