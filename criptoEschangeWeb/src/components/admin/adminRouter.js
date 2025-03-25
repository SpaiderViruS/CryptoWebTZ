import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import ExchangeRequests from '@/views/ExchangeRequests.vue';
import FeesLimits from '@/views/comissionsLimits.vue';
import CurrencyPairs from '@/views/CurrencyPairs.vue';
import NotificationContacts from '@/views/NotificationContacts.vue';

const routes = [
  {
    path: '/admin',
    component: AdminView,
    children: [
      { path: 'exchange-requests', component: ExchangeRequests },
      { path: 'fees-limits', component: FeesLimits },
      { path: 'currency-pairs', component: CurrencyPairs },
      { path: 'notification-contacts', component: NotificationContacts },
      { path: '', redirect: '/admin/exchange-requests' }, // Перенаправление на заявки по умолчанию
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;