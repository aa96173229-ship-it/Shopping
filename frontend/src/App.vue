<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth' // 引入 store

const authStore = useAuthStore()
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        
        <template v-if="!authStore.isLoggedIn">
          <RouterLink to="/login">Login / Register</RouterLink>
        </template>
        
        <template v-else>
          <a href="#" @click.prevent="authStore.logout">Logout ({{ authStore.user?.email }})</a>
        </template>
        
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
/* 原本的 CSS */
header { line-height: 1.5; max-height: 100vh; }
nav { width: 100%; font-size: 12px; text-align: center; margin-top: 2rem; }
nav a { display: inline-block; padding: 0 1rem; border-left: 1px solid var(--color-border); }
nav a:first-of-type { border: 0; }
</style>