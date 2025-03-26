<template>
  <div class="currency-pairs">
    <h2>Валютные пары</h2>
    
    <div class="controls">
      <button @click="showAddPairModal = true" class="btn-add">
        Добавить валютную пару
      </button>
    </div>
    
    <div class="pairs-list">
      <div v-for="pair in filteredPairs" :key="pair.id" class="pair-item" :class="{ inactive: !pair.active }">
        <div class="pair-header">
          <div class="pair-status">
            <span class="status-badge" :class="{ active: pair.active }">
              {{ pair.active ? 'Активна' : 'Неактивна' }}
            </span>
          </div>
          <div class="pair-icons">
            <img :src="pair.fromImage || defaultCurrencyImage" :alt="pair.from" class="currency-icon">
            <span class="arrow">→</span>
            <img :src="pair.toImage || defaultCurrencyImage" :alt="pair.to" class="currency-icon">
          </div>
          <div class="pair-names">
            {{ pair.from }} → {{ pair.to }}
          </div>
        </div>
        
        <div class="pair-actions">
          <button @click="togglePairStatus(pair)" class="btn-status">
            {{ pair.active ? 'Деактивировать' : 'Активировать' }}
          </button>
          <button @click="editPair(pair)" class="btn-edit">
            Редактировать
          </button>
          <button @click="confirmDelete(pair)" class="btn-delete">
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showAddPairModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>{{ editingPair ? 'Редактировать валютную пару' : 'Добавить новую валютную пару' }}</h3>
        
        <div class="form-group">
          <label>Валюта отправления</label>
          <input type="text" v-model="currentPair.from" placeholder="Название валюты">
          <input type="file" @change="handleFromImageUpload" accept="image/*" class="image-upload">
        </div>
        
        <div class="form-group">
          <label>Валюта получения</label>
          <input type="text" v-model="currentPair.to" placeholder="Название валюты">
          <input type="file" @change="handleToImageUpload" accept="image/*" class="image-upload">
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="currentPair.active"> Активная пара
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
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content confirm-modal">
        <h3>Подтверждение удаления</h3>
        <p>Вы уверены, что хотите удалить валютную пару "{{ pairToDelete.from }} → {{ pairToDelete.to }}"?</p>
        <div class="confirm-actions">
          <button @click="showDeleteConfirm = false" class="btn-cancel">Отмена</button>
          <button @click="deletePair" class="btn-delete">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'CurrencyPairs',
  setup() {
    const toast = useToast();
    const defaultCurrencyImage = ref('/images/default-currency.png');
    
    // Список валютных пар
    const currencyPairs = ref([
      { 
        id: 1, 
        from: 'Наличный RUB', 
        to: 'USDT TRC20', 
        fromImage: '/images/rub.png',
        toImage: '/images/usdt.png',
        active: true 
      }
    ]);
    
    // Состояние модальных окон
    const showAddPairModal = ref(false);
    const showDeleteConfirm = ref(false);
    
    // Текущая редактируемая пара
    const currentPair = ref({
      from: '',
      to: '',
      fromImage: '',
      toImage: '',
      active: true
    });
    
    // Пара для удаления
    const pairToDelete = ref(null);
    const editingPair = ref(false);
    
    // Фильтрация пар (можно добавить фильтры по активности и т.д.)
    const filteredPairs = computed(() => {
      return currencyPairs.value;
    });
    
    // Загрузка данных с сервера
    const loadPairs = async () => {
      try {
        // Здесь должен быть запрос к API
        // const response = await fetch('/api/currency-pairs');
        // const data = await response.json();
        // currencyPairs.value = data;
        
        // Для демонстрации используем моковые данные
        console.log('Валютные пары загружены');
      } catch (error) {
        toast.error('Ошибка при загрузке валютных пар');
        console.error(error);
      }
    };
    
    // Открытие модального окна для редактирования
    const editPair = (pair) => {
      currentPair.value = { ...pair };
      editingPair.value = true;
      showAddPairModal.value = true;
    };
    
    // Подтверждение удаления
    const confirmDelete = (pair) => {
      pairToDelete.value = pair;
      showDeleteConfirm.value = true;
    };
    
    // Удаление пары
    const deletePair = async () => {
      try {
        // Здесь должен быть запрос к API
        // await fetch(`/api/currency-pairs/${pairToDelete.value.id}`, { method: 'DELETE' });
        
        currencyPairs.value = currencyPairs.value.filter(
          p => p.id !== pairToDelete.value.id
        );
        
        toast.success('Валютная пара удалена');
        showDeleteConfirm.value = false;
      } catch (error) {
        toast.error('Ошибка при удалении валютной пары');
        console.error(error);
      }
    };
    
    // Изменение статуса активности
    const togglePairStatus = async (pair) => {
      try {
        pair.active = !pair.active;
        
        // Здесь должен быть запрос к API для сохранения статуса
        // await fetch(`/api/currency-pairs/${pair.id}/status`, { 
        //   method: 'PUT',
        //   body: JSON.stringify({ active: pair.active })
        // });
        
        toast.success(`Пара ${pair.from} → ${pair.to} ${pair.active ? 'активирована' : 'деактивирована'}`);
      } catch (error) {
        toast.error('Ошибка при изменении статуса');
        console.error(error);
      }
    };
    
    // Обработка загрузки изображений
    const handleFromImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          currentPair.value.fromImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
    const handleToImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          currentPair.value.toImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Сохранение пары
    const savePair = async () => {
      if (!currentPair.value.from || !currentPair.value.to) {
        toast.warning('Заполните названия обеих валют');
        return;
      }
      
      try {
        if (editingPair.value) {
          // Редактирование существующей пары
          const index = currencyPairs.value.findIndex(p => p.id === currentPair.value.id);
          if (index !== -1) {
            currencyPairs.value[index] = { ...currentPair.value };
          }
          
          // Здесь должен быть запрос к API для обновления
          // await fetch(`/api/currency-pairs/${currentPair.value.id}`, {
          //   method: 'PUT',
          //   body: JSON.stringify(currentPair.value)
          // });
          
          toast.success('Изменения сохранены');
        } else {
          // Добавление новой пары
          const newPair = {
            id: Date.now(),
            ...currentPair.value
          };
          
          currencyPairs.value.push(newPair);
          
          // Здесь должен быть запрос к API для создания
          // await fetch('/api/currency-pairs', {
          //   method: 'POST',
          //   body: JSON.stringify(newPair)
          // });
          
          toast.success('Новая валютная пара добавлена');
        }
        
        closeModal();
      } catch (error) {
        toast.error('Ошибка при сохранении');
        console.error(error);
      }
    };
    
    // Закрытие модального окна
    const closeModal = () => {
      showAddPairModal.value = false;
      showDeleteConfirm.value = false;
      currentPair.value = {
        from: '',
        to: '',
        fromImage: '',
        toImage: '',
        active: true
      };
      editingPair.value = false;
    };
    
    // Загрузка данных при монтировании компонента
    onMounted(() => {
      loadPairs();
    });
    
    return {
      defaultCurrencyImage,
      currencyPairs,
      filteredPairs,
      showAddPairModal,
      showDeleteConfirm,
      currentPair,
      pairToDelete,
      editingPair,
      editPair,
      confirmDelete,
      deletePair,
      togglePairStatus,
      handleFromImageUpload,
      handleToImageUpload,
      savePair,
      closeModal
    };
  }
};
</script>

<style scoped>
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

.image-upload {
  margin-top: 5px;
  width: 100%;
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