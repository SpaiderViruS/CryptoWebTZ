<template>
  <nav>
    <div class="nav-wrapper">
      <div class="nav-header">
        <router-link to="/" class="nav-logo">CryptoExchange</router-link>
        <button class="burger" @click="toggleMenu">☰</button>
      </div>

      <transition name="slide-fade">
        <div class="mobile-menu" v-if="menuOpen">
          <router-link to="/" @click="closeMenu">Главная</router-link>
          <router-link to="/faq" @click="closeMenu">FAQ</router-link>
          <router-link to="/contacts" @click="closeMenu">Контакты</router-link>
          <router-link to="/reviews" @click="closeMenu">Отзывы</router-link>
          <router-link to="/terms-of-service" @click="closeMenu">Правила</router-link>
          <router-link to="/privacy-policy" @click="closeMenu">Конфиденциальность</router-link>

          <div v-if="isAuthenticated" class="mobile-admin-block">
            <strong>Админ панель</strong>
            <router-link
              v-for="(item, index) in adminRoutes"
              :key="index"
              :to="item.path"
              @click="closeMenu"
            >
              {{ item.title }}
            </router-link>
          </div>

          <v-btn
            class="nav_btn"
            variant="outlined"
            @click="isAuthenticated ? logout() : openAuthDialog()"
          >
            {{ isAuthenticated ? 'Выйти' : 'Войти' }}
          </v-btn>
        </div>
      </transition>

      <div class="nav-container">
        <div class="demo-note">
          🧪 Демо версия 20.04
        </div>
        <router-link to="/">Главная</router-link>
        <router-link to="/faq">FAQ</router-link>
        <router-link to="/contacts">Контакты</router-link>
        <router-link to="/reviews">Отзывы</router-link>
        <router-link to="/terms-of-service">Правила</router-link>
        <router-link to="/privacy-policy">Конфиденциальность</router-link>

        <div class="admin-menu" v-if="isAuthenticated">
          <div class="admin-dropdown-trigger">
            Админ панель
            <div class="dropdown-menu">
              <router-link 
                v-for="(item, index) in adminRoutes" 
                :key="index" 
                :to="item.path"
              >
                {{ item.title }}
              </router-link>
            </div>
          </div>
        </div>

        <div class="auth-buttons">
          <v-btn
            v-if="!isAuthenticated"
            class="nav_btn"
            variant="outlined"
            @click="openAuthDialog"
          >
            Войти
          </v-btn>
          <v-btn
            v-else
            class="nav_btn"
            variant="outlined"
            @click="logout"
          >
            Выйти
          </v-btn>
        </div>
      </div>
    </div>
  </nav>

  <v-dialog v-model="authDialog" width="600">
    <AuthorizationDialog
      @close="closeAuthDialog"
      @login-success="handleLoginSuccess"
    />
  </v-dialog>

  <div class="watermark">Демо версия CryptoExchange</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthorizationDialog from './dialogs/authorizationDialog.vue'

const router = useRouter()
const isAuthenticated = ref(false)
const authDialog = ref(false)
const menuOpen = ref(false)

const adminRoutes = [
  { path: '/admin/exchange-requests', title: 'Заявки на обмен' },
  { path: '/admin/fees-limits', title: 'Комиссии и лимиты' },
  { path: '/admin/currency-pairs', title: 'Валютные пары' },
  { path: '/admin/notification-contacts', title: 'Уведомления и контакты' },
  { path: '/admin/chat', title: 'Чат с клиентами' },
]

onMounted(() => {
  checkAuthStatus()
})

const checkAuthStatus = () => {
  isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
}

const openAuthDialog = () => {
  authDialog.value = true
}

const closeAuthDialog = () => {
  authDialog.value = false
}

const handleLoginSuccess = () => {
  checkAuthStatus()
  closeAuthDialog()
}

const logout = () => {
  localStorage.removeItem('isAuthenticated')
  isAuthenticated.value = false
  router.push('/')
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}
</script>

<style scoped>
nav {
  background-color: #42b983;
  padding: 12px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

a:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.25);
}

.auth-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.nav_btn {
  color: white !important;
  border-color: white !important;
}

.admin-menu {
  position: relative;
}

.admin-dropdown-trigger {
  cursor: pointer;
  color: white;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 4px;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 220px;
  z-index: 1000;
  padding: 8px 0;
}

.admin-menu:hover .dropdown-menu {
  display: block;
}

.dropdown-menu a {
  color: #333;
  font-weight: 500;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.2s ease;
}

.dropdown-menu a:hover {
  background: #f2f4f7;
}

.dropdown-menu a.router-link-exact-active {
  background: #42b983;
  color: white;
}

.burger {
  display: none;
  font-size: 24px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 10px;
  background-color: #42b983;
  padding: 15px 20px;
  z-index: 999;
  border-top: 1px solid #ffffff33;
}

.mobile-menu a {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 0;
}

.mobile-admin-block {
  margin-top: 10px;
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-note {
  font-size: 12px;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

@media (max-width: 768px) {
  .nav-container {
    display: none;
  }

  .burger {
    display: block;
    margin-left: auto;
  }

  .mobile-menu {
    display: flex;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 42px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.07);
  pointer-events: none;
  user-select: none;
  z-index: 9999;
  white-space: nowrap;
}

</style>
