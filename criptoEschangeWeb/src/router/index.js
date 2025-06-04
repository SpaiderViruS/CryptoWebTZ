import { createRouter, createWebHistory } from 'vue-router';

// Основные страницы
import HomeView from '@/components/views/HomeView.vue';
import FAQview from '@/components/views/FAQview.vue';
import ContactView from '@/components/views/ContactView.vue';
import Review from '@/components/views/Review.vue';
import PrivacyPolicy from '@/components/views/PrivacyPolicy.vue';
import TermsOfService from '@/components/views/TermsOfService.vue';
import emptyPage from '@/components/emptyPage.vue';

// Админка
import AdminView from '@/components/admin/adminView.vue';
import ExchangeRequests from '@/components/admin/exchangeRequests.vue';
import FeesLimits from '@/components/admin/comissionsLimits.vue';
import CurrencyPairs from '@/components/admin/currencyPairt.vue';
import NotificationContacts from '@/components/admin/notificationСontacts.vue';
import AdminChat from '@/components/admin/adminChat.vue';
import authorizationDialog from '@/components/dialogs/authorizationDialog.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/faq', component: FAQview },
  { path: '/contacts', component: ContactView },
  { path: '/reviews', component: Review },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/terms-of-service', component: TermsOfService },

  { path: '/admin', component: authorizationDialog, meta: { guestOnly: true } },

  {
    path: '/admin-components',
    component: AdminView,
    meta: { requiresAuth: true },
    children: [
      { path: 'exchange-requests', component: ExchangeRequests },
      { path: 'fees-limits', component: FeesLimits },
      { path: 'currency-pairs', component: CurrencyPairs },
      { path: 'notification-contacts', component: NotificationContacts },
      { path: 'chat', component: AdminChat },
      { path: '', redirect: '/admin-components/exchange-requests' },
    ],
  },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: emptyPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/admin');
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/admin-components'); 
  } else {
    next();
  }
});

export default router;
