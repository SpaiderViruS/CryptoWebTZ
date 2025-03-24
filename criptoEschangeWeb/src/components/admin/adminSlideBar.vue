<template>
  <v-layout>
    <!-- Кнопка для управления меню -->
    <v-btn
      class="menu-toggle"
      @click="isDrawerOpen = !isDrawerOpen"
    >
      <v-icon>{{ isDrawerOpen ? 'mdi-close' : 'mdi-menu' }}</v-icon>
    </v-btn>

    <!-- Боковое меню -->
    <v-navigation-drawer
      v-model="isDrawerOpen"
      :permanent="false"
      :temporary="true"
      app
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.route"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Основной контент -->
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref } from 'vue';

// Состояние меню (открыто/закрыто)
const isDrawerOpen = ref(false);

// Пункты меню
const menuItems = [
  { title: 'Заявки на обмен', icon: 'mdi-swap-horizontal', route: '/admin/exchange-requests' },
  { title: 'Комиссии и лимиты', icon: 'mdi-cash', route: '/admin/fees-limits' },
  { title: 'Валютные пары', icon: 'mdi-currency-usd', route: '/admin/currency-pairs' },
  { title: 'Контакты для уведомлений', icon: 'mdi-bell', route: '/admin/notification-contacts' },
];
</script>

<style scoped>
.menu-toggle {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
}
</style>