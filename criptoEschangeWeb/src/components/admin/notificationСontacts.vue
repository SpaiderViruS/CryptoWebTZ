<template>
    <div class="notification-settings">
      <h2>Контакты для уведомлений</h2>
      
      <div class="description">
        <p>Добавьте Telegram-аккаунты менеджеров для получения уведомлений о новых заявках.</p>
        <p>Формат ввода: @username (например, @ivanov_team)</p>
      </div>
  
      <div class="accounts-list" v-if="!loading">
        <div v-for="(account, index) in telegramAccounts" 
             :key="index" 
             class="account-item">
          <div class="input-group">
            <input
              type="text"
              v-model="account.value"
              placeholder="@username"
              :class="{ 'invalid': !isValidAccount(account.value) }"
              @input="validateAccounts"
            >
          <div class="status-toggle">
            <label>
              <input 
                type="checkbox" 
                v-model="account.is_active"
              > Активен
            </label>
          </div>
            <button 
              @click="removeAccount(index)"
              class="btn-remove"
              :disabled="telegramAccounts.length === 1"
            >
              ×
            </button>
          </div>
          <div v-if="!isValidAccount(account.value)" class="error-message">
            Некорректный формат аккаунта
          </div>
        </div>
        
        <button @click="addAccount" class="btn-add">
          + Добавить еще аккаунт
        </button>
      </div>
  
      <div v-else class="loading">
        Загрузка данных...
      </div>
  
      <div class="actions">
        <button 
          @click="saveAccounts" 
          class="btn-save"
          :disabled="!isFormValid || saving"
        >
          <span v-if="saving">Сохранение...</span>
          <span v-else>Сохранить изменения</span>
        </button>
      </div>
    </div>
  </template>
<script>
import { ref, inject, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

  export default {
    setup() {
      const toast = useToast();
      const $api = inject('$api');
      
      const telegramAccounts = ref([]);
      const originalAccounts = ref([]);
      const loading = ref(true);
      const saving = ref(false);

      // Загрузка контактов
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

      // Валидация аккаунта
      const isValidAccount = (account) => {
        return /^@[a-zA-Z0-9_]{5,32}$/.test(account);
      };

      // Проверка всей формы
      const isFormValid = computed(() => {
        return telegramAccounts.value.every(a => isValidAccount(a.value)) &&
              telegramAccounts.value.length > 0;
      });

      // Добавление нового поля
      const addAccount = () => {
        telegramAccounts.value.push({ 
          value: '', 
          is_active: false,
          id: null 
        });
      };

      // Удаление аккаунта
      const removeAccount = async (index) => {
        const account = telegramAccounts.value[index];
        if (!account.id) {
          telegramAccounts.value.splice(index, 1);
          return;
        }

        try {
          await $api.delete(`/contacts/${account.id}`);
          telegramAccounts.value.splice(index, 1);
          toast.success('Аккаунт успешно удален');
        } catch (error) {
          toast.error(error.response?.data?.message || 'Ошибка удаления');
        }
      };

      // Сохранение изменений
      const saveAccounts = async () => {
        try {
          saving.value = true;
          
          // Валидация полей
          const requiredFields = [
            { value: telegramAccounts.value.length, name: 'Хотя бы один аккаунт' },
            ...telegramAccounts.value.map((acc, index) => ({
              value: acc.value,
              name: `Аккаунт #${index + 1}`
            }))
          ];

          for (const { value, name } of requiredFields) {
            if (!value || (typeof value === 'string' && !value.trim())) {
              toast.warning(`Заполните поле: ${name}`);
              return;
            }
          }

          // Обработка новых и существующих записей
          const updatePromises = telegramAccounts.value
            .filter(acc => acc.id && isValidAccount(acc.value))
            .map(acc => $api.put(`/contacts/${acc.id}`, {
              telegram_account: acc.value.trim(),
              is_active: acc.is_active
            }));

          const createPromises = telegramAccounts.value
            .filter(acc => !acc.id && isValidAccount(acc.value))
            .map(acc => $api.post('/contacts', {
              telegram_account: acc.value.trim(),
              is_active: acc.is_active
            }));

          // Обновление статусов
          const statusPromises = telegramAccounts.value
            .filter(acc => {
              const original = originalAccounts.value.find(o => o.id === acc.id);
              return original && original.is_active !== acc.is_active;
            })
            .map(acc => $api.put(`/contacts/activity/${acc.id}`, {
              is_active: acc.is_active
            }));

          await Promise.all([
            ...updatePromises,
            ...createPromises,
            ...statusPromises
          ]);

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
        isFormValid,
        isValidAccount,
        addAccount,
        removeAccount,
        saveAccounts
      };
    }
  };
  </script>
  <style scoped>
  /* Добавим стиль для чекбокса активности */
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
  }
  
  input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input.invalid {
    border-color: #ff4444;
    background-color: #fff6f6;
  }
  
  .btn-remove {
    padding: 0 1rem;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s;
  }
  
  .btn-remove:disabled {
    background: #ddd;
    cursor: not-allowed;
  }
  
  .btn-remove:hover:not(:disabled) {
    background: #cc0000;
  }
  
  .error-message {
    color: #ff4444;
    font-size: 0.9rem;
    margin-top: 0.3rem;
  }
  
  .btn-add {
    background: none;
    border: 2px dashed #ddd;
    color: #666;
    padding: 0.8rem 1.5rem;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .btn-add:hover {
    border-color: #4CAF50;
    color: #4CAF50;
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