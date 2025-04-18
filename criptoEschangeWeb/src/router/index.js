import { createRouter, createWebHistory } from 'vue-router';

// Основные страницы
import HomeView from '@/components/views/HomeView.vue';
import FAQview from '@/components/views/FAQview.vue';
import ContactView from '@/components/views/ContactView.vue';
import Review from '@/components/views/Review.vue';
import PrivacyPolicy from '@/components/views/PrivacyPolicy.vue';
import TermsOfService from '@/components/views/TermsOfService.vue';

// Админка
import AdminView from '@/components/admin/adminView.vue';
import ExchangeRequests from '@/components/admin/exchangeRequests.vue';
import FeesLimits from '@/components/admin/comissionsLimits.vue';
import CurrencyPairs from '@/components/admin/currencyPairt.vue';
import NotificationContacts from '@/components/admin/notificationСontacts.vue';
import AdminChat from '@/components/admin/adminChat.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/faq', component: FAQview },
  { path: '/contacts', component: ContactView },
  { path: '/reviews', component: Review },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/terms-of-service', component: TermsOfService },

  {
    path: '/admin',
    component: AdminView,
    meta: { requiresAuth: true },
    children: [
      { path: 'exchange-requests', component: ExchangeRequests },
      { path: 'fees-limits', component: FeesLimits },
      { path: 'currency-pairs', component: CurrencyPairs },
      { path: 'notification-contacts', component: NotificationContacts },
      { path: 'chat', component: AdminChat },
      { path: '', redirect: '/admin/exchange-requests' },
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
    next('/'); 
  } else {
    next();
  }
});

export default router;
