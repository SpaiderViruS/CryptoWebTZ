import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/components/views/HomeView.vue';
import FAQview from '@/components/views/FAQview.vue';
import ContactView from '@/components/views/ContactView.vue';
import Review from '@/components/views/Review.vue';

import adminView from '@/components/admin/adminView.vue';
import exchangeRequests from '@/components/admin/exchangeRequests.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/faq', component: FAQview },
  { path: '/contacts', component: ContactView },
  { path: '/reviews', component: Review },
  {
    path: '/admin',
    component: adminView,
    meta: { requiresAuth: true }, // Требует авторизации
    children: [
      { path: 'exchange-requests', component: exchangeRequests },
      // { path: 'fees-limits', component: FeesLimits },
      // { path: 'currency-pairs', component: CurrencyPairs },
      // { path: 'notification-contacts', component: NotificationContacts },
      { path: '', redirect: '/admin/exchange-requests' }, // Перенаправление на заявки по умолчанию
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;