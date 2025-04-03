<template>
  <div class="currency-pairs">
    <h2>Валютные пары</h2>
    
    <div class="controls">
      <button @click="showAddPairModal = true" class="btn-add">
        Добавить валютную пару
      </button>
    </div>

    <div class="pairs-list">
      <div v-for="pair in mappedPairs" :key="pair.id" class="pair-item" :class="{ inactive: !pair.active }">
        <div class="pair-header">
          <div class="pair-status">
            <span class="status-badge" :class="{ active: pair.active }">
              {{ pair.active ? 'Активна' : 'Неактивна' }}
            </span>
          </div>
          <div class="pair-icons">
            <img :src="pair.fromImage" :alt="pair.from" class="currency-icon">
            <span class="arrow">→</span>
            <img :src="pair.toImage" :alt="pair.to" class="currency-icon">
          </div>
          <div class="pair-names">
            {{ pair.from }} → {{ pair.to }}
          </div>
        </div>
        
        <div class="pair-actions">
          <button @click="togglePairStatus(pair)" class="btn-status">
            {{ pair.active ? 'Деактивировать' : 'Активировать' }}
          </button>
          <button @click="editPair(pair)" class="btn-edit">Редактировать</button>
          <button @click="confirmDelete(pair)" class="btn-delete">Удалить</button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showAddPairModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>{{ editingPair ? 'Редактировать пару' : 'Новая пара' }}</h3>
        
        <div class="form-group">
          <label>Отправляемая валюта</label>
          <select v-model="currentPair.sell_currency">
            <option 
              v-for="currency in availableCurrencies" 
              :value="currency.id"
              :key="'sell-' + currency.id"
            >
              {{ currency.value_full }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Получаемая валюта</label>
          <select v-model="currentPair.buy_currency">
            <option 
              v-for="currency in availableCurrencies" 
              :value="currency.id"
              :key="'buy-' + currency.id"
            >
              {{ currency.value_full }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="currentPair.active"> Активная
          </label>
        </div>

        <div class="form-actions">
          <button @click="closeModal" class="btn-cancel">Отмена</button>
          <button @click="savePair" class="btn-save">
            {{ editingPair ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Подтверждение удаления -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content confirm-modal">
        <h3>Подтвердите удаление</h3>
        <p>Удалить пару "{{ deletePairInfo }}"?</p>
        <div class="confirm-actions">
          <button @click="showDeleteConfirm = false" class="btn-cancel">Нет</button>
          <button @click="deletePair" class="btn-delete">Да, удалить</button>
        </div>
      </div>
    </div>
  </div>
  <button @click="showCurrencyManager = true" class="btn-add">
    Управление валютами
  </button>
  
  <div v-if="showCurrencyManager" class="modal">
    <div class="modal-content">
      <span class="close" @click="closeCurrencyModal">&times;</span>
      <h3>{{ editingCurrency ? 'Редактирование валюты' : 'Новая валюта' }}</h3>

      <div class="currency-form">
        <div class="form-group">
          <label>Полное название</label>
          <input 
            v-model="currentCurrency.value_full" 
            type="text"
            placeholder="Например: Российский рубль"
          >
        </div>

        <div class="form-group">
          <label>Короткий код</label>
          <input 
            v-model="currentCurrency.value_short" 
            type="text"
            placeholder="Например: RUB"
          >
        </div>

        <div class="form-group">
          <label>Изображение (до 10 МБ, макс. 300x300px)</label>
          <div class="image-upload-container">
            <img 
              v-if="currentCurrency.image_url" 
              :src="currentCurrency.image_url" 
              class="currency-preview"
            >
            <input 
              type="file" 
              @change="handleImageUpload"
              accept="image/*"
            >
          </div>
        </div>

        <div class="form-actions">
          <button @click="closeCurrencyModal" class="btn-cancel">Отмена</button>
          <button @click="saveCurrency" class="btn-save">
            {{ editingCurrency ? 'Сохранить' : 'Добавить' }}
          </button>
        </div>
        </div>
      <!-- Список валют -->
      <div class="currencies-list">
        <div 
          v-for="currency in availableCurrencies" 
          :key="currency.id"
          class="currency-item"
        >
          <img 
            :src="currency.image_url || defaultCurrencyImage" 
            class="currency-icon"
          >
          
          <div class="currency-info">
            <div>{{ currency.value_full }}</div>
            <div class="currency-short">{{ currency.value_short }}</div>
          </div>

          <div class="currency-actions">
            <button 
              @click="startEditCurrency(currency)" 
              class="btn-edit"
            >
              Редактировать
            </button>
            <button 
              @click="deleteCurrency(currency.id)" 
              class="btn-delete"
            >
              Удалить
            </button>
          </div>
        </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, inject, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'CurrencyPairs',
  setup() {
    const toast = useToast();
    const $api = inject('$api');

    const showCurrencyManager = ref(false);
    const currentCurrency = ref({
      id: null,
      value_full: '',
      value_short: '',
      image_url: null
    });
    const editingCurrency = ref(false);

    const defaultCurrencyImage = ref('/images/default-currency.png');
    const availableCurrencies = ref([]);
    const currencyPairs = ref([]);
    
    const isDragging = ref(false)
    const currentDraggedIndex = ref(-1)
    const dragStartIndex = ref(-1)

    // Состояния UI
    const showAddPairModal = ref(false);
    const showDeleteConfirm = ref(false);
    const editingPair = ref(false);
    const pairToDelete = ref(null);
    
    // Текущая редактируемая пара
    const currentPair = ref({
      id: null,
      sell_currency: null,
      buy_currency: null,
      commission: 2.5,
      min_amount: 1000,
      max_amount: 500000,
      active: true
    });
     // Преобразованные пары для отображения
    const mappedPairs = computed(() => {
      return currencyPairs.value.map(pair => {
        const fromCurrency = availableCurrencies.value.find(c => c.value_short === pair.sell_currency);
        const toCurrency = availableCurrencies.value.find(c => c.value_short === pair.buy_currency);

        return {
          ...pair,
          from: pair.sell_currency || 'Неизвестно',
          to: pair.buy_currency || 'Неизвестно',
          fromImage: fromCurrency.image_url || defaultCurrencyImage.value,
          toImage: toCurrency.image_url || defaultCurrencyImage.value
        };
      });
    });

    const handleDragStart = (index) => {
      isDragging.value = true
      dragStartIndex.value = index
      currentDraggedIndex.value = index
    }

    const handleDragOver = (index) => {
      if (!isDragging.value) return
      currentDraggedIndex.value = index
      
      const newCurrencies = [...availableCurrencies.value]
      const draggedItem = newCurrencies[dragStartIndex.value]
      
      newCurrencies.splice(dragStartIndex.value, 1)
      newCurrencies.splice(index, 0, draggedItem)
      
      availableCurrencies.value = newCurrencies
      dragStartIndex.value = index
    }

    const handleDrop = () => {
      isDragging.value = false
      currentDraggedIndex.value = -1
      dragStartIndex.value = -1
    }


    // Информация для подтверждения удаления
    const deletePairInfo = computed(() => {
      return pairToDelete.value 
        ? `${pairToDelete.value.sell_currency} → 
           ${pairToDelete.value.buy_currency}`
        : '';
    });

    // Загрузка данных
    const loadData = async () => {
    try {
      const currencies = await $api.get('/dictionary/currencys');
      const pairs = await $api.get('/curency_pair/');
      const fees = await $api.get('/fees_limit/');

      availableCurrencies.value = currencies.data.data.map(currency => {
        // Формируем URL для изображения
        const imageUrl = currency.file_bin 
          ? `data:image/png;base64,${currency.file_bin}` // предполагаем PNG формат
          : defaultCurrencyImage.value;

        return {
          ...currency,
          image_url: imageUrl,
          // Сохраняем оригинальные данные
          icon_id: currency.icon_id,
          file_bin: currency.file_bin
        };
      });

      currencyPairs.value = pairs.data.map(pair => {
        const fee = fees.data.find(f => f.currency_pair_id === pair.id) || {};
        return {
          ...pair,
          active: pair.is_active,
          fee: {
            id: fee.id,
            commission: parseFloat(fee.commission || 0).toFixed(2),
            min_amount: parseFloat(fee.min_amount || 0).toFixed(2),
            max_amount: parseFloat(fee.max_amount || 0).toFixed(2)
          }
        };
      });

    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Ошибка загрузки данных');
    }
  };

      // Редактирование пары
        const editPair = (mappedPair) => {
        // Находим исходную пару по ID
        const originalPair = currencyPairs.value.find(p => p.id === mappedPair.id);
        
        if (!originalPair) {
          toast.error('Ошибка редактирования: пара не найдена');
          return;
        }

        currentPair.value = {
          id: originalPair.id,
          sell_currency: originalPair.sell_currency,
          buy_currency: originalPair.buy_currency,
          commission: originalPair.fee.commission,
          min_amount: originalPair.fee.min_amount,
          max_amount: originalPair.fee.max_amount,
          active: originalPair.active
        };
        
        editingPair.value = true;
        showAddPairModal.value = true;
      };
    // Удаление пары
    const deletePair = async () => {
      try {
        await $api.delete(`/curency_pair/${pairToDelete.value.id}`);
        await loadData();
        toast.success('Пара удалена');
        showDeleteConfirm.value = false;
      } catch (error) {
        toast.error('Ошибка удаления');
        console.error(error);
      }
    };

    // Сохранение изменений
    const savePair = async () => {
      try {
        // Проверка заполнения обязательных полей
        const requiredFields = [
          { value: currentPair.value.sell_currency, name: 'Отправляемая валюта' },
          { value: currentPair.value.buy_currency, name: 'Получаемая валюта' },
          { value: currentPair.value.commission, name: 'Комиссия' },
          { value: currentPair.value.min_amount, name: 'Минимальная сумма' },
          { value: currentPair.value.max_amount, name: 'Максимальная сумма' }
        ];

        for (const field of requiredFields) {
          if (field.value === null || field.value === undefined || field.value === '') {
            toast.warning(`Заполните поле: ${field.name}`);
            return;
          }
        }

        // Проверка числовых значений
        if (isNaN(currentPair.value.commission) || 
            isNaN(currentPair.value.min_amount) || 
            isNaN(currentPair.value.max_amount)) {
          toast.warning('Все числовые поля должны содержать допустимые значения');
          return;
        }

        // Проверка на одинаковые валюты
        if (currentPair.value.sell_currency === currentPair.value.buy_currency) {
          toast.warning('Выберите разные валюты');
          return;
        }

              // Проверка на существование такой пары
        const isDuplicate = currencyPairs.value.some(pair => {
          // Пропускаем проверку для редактируемой пары
          if (editingPair.value && pair.id === currentPair.value.id) return false;

          // Получаем данные валют из справочника
          const currentSellCurrency = availableCurrencies.value.find(
            c => c.id === currentPair.value.sell_currency
          );
          const currentBuyCurrency = availableCurrencies.value.find(
            c => c.id === currentPair.value.buy_currency
          );

          // Сравниваем по value_short валют
          return (
            (pair.sell_currency === currentSellCurrency?.value_short &&
            pair.buy_currency === currentBuyCurrency?.value_short) ||
            (pair.sell_currency === currentBuyCurrency?.value_short &&
            pair.buy_currency === currentSellCurrency?.value_short)
          );
        });

        if (isDuplicate) {
          toast.warning('Такая пара валют уже существует');
          return;
        }

              // Проверка на существование пары через сервер
          const { data: serverCurrencies } = await $api.get('/dictionary/currencys');
          const { data: serverPairs } = await $api.get('/curency_pair/');

          // Создаем карту соответствия ID валют и их value_short
          const currencyMap = new Map(
            serverCurrencies.data.map(c => [c.id, c.value_short])
          );

          // Получаем value_short для выбранных валют
          const sellCurrencyShort = currencyMap.get(currentPair.value.sell_currency);
          const buyCurrencyShort = currencyMap.get(currentPair.value.buy_currency);

          // Проверяем существование пары
          const exists = serverPairs.some(pair => {
            // Пропускаем проверку для редактируемой пары
            if (editingPair.value && pair.id === currentPair.value.id) return false;

            const pairSell = currencyMap.get(pair.sell_currency);
            const pairBuy = currencyMap.get(pair.buy_currency);
          

            // Проверяем оба направления
            return (pairSell === sellCurrencyShort && pairBuy === buyCurrencyShort) ||
                  (pairSell === buyCurrencyShort && pairBuy === sellCurrencyShort);
          });


          if (exists) {
            toast.warning('Такая пара или обратная ей уже существует');
            return;
          }

        // Проверка комиссии
        if (Number(currentPair.value.commission) < 0 || 
            Number(currentPair.value.commission) > 100) {
          toast.warning('Комиссия должна быть в диапазоне от 0 до 100%');
          return;
        }
        
        if (currentPair.value.sell_currency === currentPair.value.buy_currency) {
          toast.warning('Выберите разные валюты');
          return;
        }

        const pairData = {
          sell_currency: currentPair.value.sell_currency,
          buy_currency: currentPair.value.buy_currency,
          is_active: currentPair.value.active,
          id: currentPair.value.id
        };

        if (editingPair.value) {
          await $api.put(`/curency_pair/`, pairData);
          toast.success('Изменения сохранены');
        } else {
          const newPair = await $api.post('/curency_pair/', pairData);

          toast.success('Новая пара добавлена');
        }

        await loadData();
        closeModal();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка сохранения');
        console.error(error);
      }
    };

    const closeModal = () => {
      showAddPairModal.value = false;
      showDeleteConfirm.value = false;
      editingPair.value = false;
    };

    const deleteCurrency = async (id) => {
      try {
        await $api.delete(`/dictionary/currencys/${id}`);
        
        availableCurrencies.value = availableCurrencies.value.filter(
          c => c.id !== id
        );
        
        toast.success('Валюта удалена');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка удаления');
      }
    };

    const saveCurrency = async () => {
      try {
        const formData = new FormData();
        
        formData.append('value_full', currentCurrency.value.value_full);
        formData.append('value_short', currentCurrency.value.value_short);

        if (currentCurrency.value.file) {
          formData.append('file_name', currentCurrency.value.file.name);
          formData.append('file', currentCurrency.value.file);
        }

        if (editingCurrency.value) {
          formData.append('id', currentCurrency.value.id);
        }

        const endpoint = editingCurrency.value 
          ? `/dictionary/currencys/${currentCurrency.value.id}`
          : '/dictionary/currencys';

        const method = editingCurrency.value ? 'put' : 'post';

        const { data } = await $api[method](endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (editingCurrency.value) {
          const index = availableCurrencies.value.findIndex(
            c => c.id === currentCurrency.value.id
          );
          availableCurrencies.value.splice(index, 1, data);
        } else {
          availableCurrencies.value.push(data);
        }

        toast.success(editingCurrency.value 
          ? 'Изменения сохранены' 
          : 'Валюта добавлена');

        currentCurrency.value = {
          id: null,
          value_full: '',
          value_short: '',
          image_url: null,
          file: null
        };
        editingCurrency.value = false;
        showCurrencyManager.value = false;

        // Принудительно обновим список валют (если нужно от сервера)
        await loadData();
        closeCurrencyModal();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Ошибка сохранения');
      }
    };

    const startEditCurrency = (currency) => {
      currentCurrency.value = { ...currency };
      editingCurrency.value = true;
      showCurrencyManager.value = true;
    };


    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
       
      currentCurrency.value.file = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        currentCurrency.value.image_url = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const closeCurrencyModal = () => {
      showCurrencyManager.value = false;
      editingCurrency.value = false;
      currentCurrency.value = {
        id: null,
        value_full: '',
        value_short: '',
        image_url: null
      };
    };

    onMounted(loadData);

    return {
      defaultCurrencyImage,
      mappedPairs,
      showAddPairModal,
      showCurrencyManager,
      currentCurrency,
      handleImageUpload,
      saveCurrency,
      closeCurrencyModal,
      showDeleteConfirm,
      currentPair,
      deletePairInfo,
      availableCurrencies,
      deleteCurrency,
      startEditCurrency,
      editPair,
      handleDragStart,
      handleDragOver,
      handleDrop,
      isDragging,
      currentDraggedIndex,
      confirmDelete: (pair) => {
        pairToDelete.value = pair;
        showDeleteConfirm.value = true;
      },
      deletePair,
      savePair,
      closeModal,
      togglePairStatus: async (pair) => {
        try {
          const newStatus = !pair.active;
          await $api.put(`/curency_pair/activity/${pair.id}`, { 
            id: pair.id,
            is_active: newStatus });
          pair.active = newStatus;
          toast.success(`Пара ${newStatus ? 'активирована' : 'деактивирована'}`);
          await loadData();

        } catch (error) {
          toast.error('Ошибка изменения статуса');
          console.error(error);
        }
      }
    };
    
  }
  
};

</script>

<style scoped>

.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  transition: all 0.3s;
}

.drag-handle {
  cursor: move;
  padding-right: 10px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.currency-item[draggable="true"] {
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.currency-form {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.currencies-list {
  max-height: 60vh;
  overflow-y: auto;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.currency-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.currency-info {
  flex-grow: 1;
}

.currency-short {
  color: #666;
  font-size: 0.9em;
}

.currency-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #ffc107;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.currency-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.currency-pairs {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
  text-align: right;
}

.btn-add {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background: #45a049;
}

.pairs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.pair-item {
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #4CAF50;
}

.pair-item.inactive {
  border-left-color: #cccccc;
  opacity: 0.7;
}

.pair-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.pair-status {
  align-self: flex-start;
  margin-bottom: 10px;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge:not(.active) {
  background: #ffebee;
  color: #c62828;
}

.pair-icons {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.currency-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.arrow {
  margin: 0 10px;
  color: #666;
}

.pair-names {
  font-weight: bold;
  text-align: center;
}

.pair-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.pair-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.currency-icon {
  background: #f5f5f5 url('/images/default-currency.png') no-repeat center;
  object-fit: cover;
}

.btn-status {
  background: #2196F3;
  color: white;
}

.btn-status:hover {
  background: #0b7dda;
}

.btn-edit {
  background: #FFC107;
  color: black;
}

.btn-edit:hover {
  background: #ffb300;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}

/* Модальные окна */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  position: relative;
}

.confirm-modal {
  text-align: center;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.form-actions, .confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
} 

.btn-cancel {
  background: #f1f1f1;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  background: #45a049;
}

@media (max-width: 768px) {
  .pairs-list {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 90%;
  }
}
</style>