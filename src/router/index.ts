import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AuthPage from '@/pages/AuthPage.vue'
import ErrorPage from '@/pages/ErrorPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import BoardPage from '@/pages/BoardPage.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const userStore = useUserStore()
        // Если пользователь авторизован, перенаправляем на /home
        return userStore.isAuthenticated ? '/home' : '/auth'
      },
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthPage,
      meta: { requiresGuest: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
      meta: { requiresAuth: true },
    },

    {
      path: '/board/:id',
      name: 'board',
      component: BoardPage,
      meta: { requiresAuth: true },
    }, // <--- Новый маршрут для доски
    // Страница ошибки 404
    {
      path: '/:pathMatch(.*)*',
      name: 'error',
      component: ErrorPage,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Если пользователь авторизован, но пытается попасть на страницу /auth, перенаправляем на /home
  if (to.name === 'auth' && userStore.isAuthenticated) {
    next('/home')
  }
  // Если пользователь не авторизован, а пытается попасть на защищённую страницу, перенаправляем на /auth
  else if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/auth')
  }
  // Если пользователь авторизован и пытается попасть на /auth, перенаправляем на /home
  else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next('/home')
  } else {
    next() // продолжаем переход
  }
})

export default router
