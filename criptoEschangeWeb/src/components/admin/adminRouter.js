import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '@/views/AdminView.vue';
import ExchangeRequests from '@/views/ExchangeRequests.vue';
import FeesLimits from '@/views/comissionsLimits.vue';
import CurrencyPairs from '@/views/CurrencyPairs.vue';
import NotificationContacts from '@/views/NotificationContacts.vue';
import AdminChat from '@/views/adminChat.vue'; 

const routes = [
  {
    path: '/admin-components',
    component: AdminView,
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

export default router;