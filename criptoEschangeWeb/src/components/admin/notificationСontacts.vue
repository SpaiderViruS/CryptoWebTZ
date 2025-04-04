<template>
  <div class="notification-settings">
    <h2>Контакты для уведомлений</h2>

    <div class="description">
      <p>Список Telegram-аккаунтов, которые подписались на бота для получения уведомлений.</p>
      <p>Подписка осуществляется через команду <code>/start</code> в боте: 
        <a href="https://t.me/VaultEXBot" target="_blank">t.me/VaultEXBot</a>
      </p>
    </div>

    <div class="accounts-list" v-if="!loading">
      <div v-for="(account, index) in telegramAccounts" 
           :key="index" 
           class="account-item">
        <div class="input-group">
          <input
            type="text"
            :value="account.value"
            disabled
          >
          <div class="status-toggle">
            <label>
              <input 
                type="checkbox" 
                v-model="account.is_active"
              > Активен
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      Загрузка данных...
    </div>

    <div class="actions">
      <button 
        @click="saveAccounts" 
        class="btn-save"
        :disabled="saving"
      >
        <span v-if="saving">Сохранение...</span>
        <span v-else>Сохранить изменения</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const toast = useToast();
    const $api = inject('$api');

    const telegramAccounts = ref([]);
    const originalAccounts = ref([]);
    const loading = ref(true);
    const saving = ref(false);

    const loadAccounts = async () => {
      try {
        const response = await $api.get('/contacts');
        telegramAccounts.value = response.data.map(a => ({
          id: a.id,
          value: a.telegram_account,
          is_active: a.is_active
        }));
        originalAccounts.value = [...telegramAccounts.value];
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка загрузки данных');
      } finally {
        loading.value = false;
      }
    };

    const saveAccounts = async () => {
      try {
        saving.value = true;

        const statusPromises = telegramAccounts.value
          .filter(acc => {
            const original = originalAccounts.value.find(o => o.id === acc.id);
            return original && original.is_active !== acc.is_active;
          })
          .map(acc => $api.put(`/contacts/activity/${acc.id}`, {
            is_active: acc.is_active
          }));

        await Promise.all(statusPromises);
        toast.success('Настройки успешно сохранены');
        await loadAccounts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка сохранения');
      } finally {
        saving.value = false;
      }
    };

    onMounted(loadAccounts);

    return {
      telegramAccounts,
      loading,
      saving,
      saveAccounts
    };
  }
};
</script>

<style scoped>
.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status-toggle label {
  font-size: 0.9rem;
  color: #666;
}

.notification-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.description {
  margin-bottom: 2rem;
  color: #666;
}

.description p {
  margin: 0.5rem 0;
}

.description a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  transition: 0.3s;
}

.description a:hover {
  text-decoration: underline;
  opacity: 0.9;
}

.accounts-list {
  margin-bottom: 2rem;
}

.account-item {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f9f9f9;
}

.actions {
  text-align: right;
}

.btn-save {
  background: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-save:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .notification-settings {
    padding: 1rem;
  }

  input {
    padding: 0.6rem;
  }
}
</style>
