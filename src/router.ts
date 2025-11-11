// src/router.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Keep dashboard on root (non-breaking)
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'), // or '../pages/Dashboard.vue' if no '@' alias
    meta: { title: 'Dashboard • MailTrace' }
  },
  { path: '/dashboard', redirect: '/' },
  { path: '/app', redirect: '/' },

  // Landing page (no sidebar)
  {
    path: '/welcome',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue'),
    meta: { title: 'MailTrace — Match Mail + CRM', marketing: true }
  },

  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { title: 'Home • MailTrace' }
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('@/pages/MapPage.vue'),
    meta: { title: 'Map • MailTrace' }
  },
  {
    path: '/paywall',
    name: 'Paywall',
    component: () => import('@/pages/Paywall.vue'),
    meta: { title: 'Paywall • MailTrace' }
  },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (saved) return saved
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = (to.meta?.title as string) || 'MailTrace'
})

export default router