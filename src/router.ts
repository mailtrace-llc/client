// src/router.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AUTH_BASE } from '@/config/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { title: 'Home • MailTrace', marketing: true },
  },
  { path: '/home', redirect: '/' },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { title: 'Dashboard • MailTrace' },
  },
  { path: '/app', redirect: '/dashboard' },

  {
    path: '/map',
    name: 'Map',
    component: () => import('@/pages/MapPage.vue'),
    meta: { title: 'Map • MailTrace' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, saved) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (saved) return saved
    return { top: 0 }
  },
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  if (to.meta?.marketing) return next();

  if (!auth.initialized && !auth.loading) {
    await auth.fetchMe();
  }

  if (!auth.isAuthenticated) {
    const params = new URLSearchParams({ next: to.fullPath || "/" });
    const base = AUTH_BASE || "";
    window.location.href = `${base}/auth/login?${params.toString()}`;
    return;
  }

  next();
});

router.afterEach((to) => {
  document.title = (to.meta?.title as string) || 'MailTrace'
})

export default router