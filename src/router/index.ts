import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import AuthPage from '@/pages/AuthPage.vue'
import ErrorPage from '@/pages/ErrorPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import BoardPage from '@/pages/BoardPage.vue'
import TeamsPage from '@/pages/TeamsPage.vue'
import TeamPage from '@/pages/TeamPage.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const userStore = useUserStore()
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
    },
    {
      path: '/teams',
      name: 'teams',
      component: TeamsPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/team/:id',
      name: 'team',
      component: TeamPage,
      meta: { requiresAuth: true },
      props: true
    },
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

  if (to.name === 'auth' && userStore.isAuthenticated) {
    next('/home')
  }
  else if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/auth')
  }
  else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
