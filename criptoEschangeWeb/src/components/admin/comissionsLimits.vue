<template>
  <div class="fees-and-limits">
    <h2>Комиссии и лимиты</h2>
    
    <!-- Комиссии обменника -->
    <div class="section">
      <h3>Комиссии обменника</h3>
      
      <div class="currency-pairs">
        <div v-for="(pair, index) in currencyPairs" :key="pair.id" class="pair-item">
          <div class="pair-info">
            <span>{{ pair.from }} → {{ pair.to }}</span>
            <button @click="removePair(index)" class="btn-remove">×</button>
          </div>
          
          <div class="form-group">
            <label>Комиссия (%)</label>
            <input 
              type="number" 
              v-model.number="pair.fee" 
              min="0" 
              max="100" 
              step="0.01"
              @change="updatePair(pair)"
            >
          </div>
        </div>
      </div>
      
      <div class="add-pair-form">
        <h4>Добавить новую валютную пару</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Отдаете</label>
            <select v-model="newPair.from">
              <option v-for="currency in availableCurrencies" :value="currency">{{ currency }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Получаете</label>
            <select v-model="newPair.to">
              <option v-for="currency in availableCurrencies" :value="currency">{{ currency }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Комиссия (%)</label>
            <input type="number" v-model.number="newPair.fee" min="0" max="100" step="0.01">
          </div>
          
          <button @click="addPair" class="btn-add">Добавить</button>
        </div>
      </div>
    </div>
    
    <!-- Лимиты объемов -->
    <div class="section">
      <h3>Лимиты объемов</h3>
      
      <div class="volume-limits">
        <div v-for="(limit, index) in volumeLimits" :key="limit.id" class="limit-item">
          <div class="limit-info">
            <span>{{ limit.currency }}</span>
            <button @click="removeLimit(index)" class="btn-remove">×</button>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Минимальный объем</label>
              <input 
                type="number" 
                v-model.number="limit.min" 
                min="0" 
                step="0.01"
                @change="updateLimit(limit)"
              >
            </div>
            
            <div class="form-group">
              <label>Максимальный объем</label>
              <input 
                type="number" 
                v-model.number="limit.max" 
                min="0" 
                step="0.01"
                @change="updateLimit(limit)"
              >
            </div>
          </div>
        </div>
      </div>
      
      <div class="add-limit-form">
        <h4>Добавить лимиты для валюты</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Валюта</label>
            <select v-model="newLimit.currency">
              <option v-for="currency in availableCurrencies" :value="currency">{{ currency }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Минимальный объем</label>
            <input type="number" v-model.number="newLimit.min" min="0" step="0.01">
          </div>
          
          <div class="form-group">
            <label>Максимальный объем</label>
            <input type="number" v-model.number="newLimit.max" min="0" step="0.01">
          </div>
          
          <button @click="addLimit" class="btn-add">Добавить</button>
        </div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="saveAll" class="btn-save">Сохранить все изменения</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'FeesAndLimits',
  setup() {
    const toast = useToast();
    
    // Доступные валюты
    const availableCurrencies = ref(['Наличный RUB', 'USDT TRC20', 'BTC', 'ETH', 'BNB']);
    
    // Валютные пары и комиссии
    const currencyPairs = ref([
      { id: 1, from: 'Наличный RUB', to: 'USDT TRC20', fee: 2.5 }
    ]);
    
    // Лимиты объемов
    const volumeLimits = ref([
      { id: 1, currency: 'Наличный RUB', min: 1000, max: 500000 },
      { id: 2, currency: 'USDT TRC20', min: 50, max: 10000 }
    ]);
    
    // Форма для новой пары
    const newPair = ref({
      from: 'Наличный RUB',
      to: 'USDT TRC20',
      fee: 2.5
    });
    
    // Форма для новых лимитов
    const newLimit = ref({
      currency: 'Наличный RUB',
      min: 1000,
      max: 5000
    });
    
    // Загрузка данных с сервера
    const loadData = async () => {
      try {
        // Здесь должен быть запрос к API
        // const response = await fetch('/api/fees-and-limits');
        // const data = await response.json();
        // currencyPairs.value = data.pairs;
        // volumeLimits.value = data.limits;
        
        // Для демонстрации используем моковые данные
        console.log('Данные загружены');
      } catch (error) {
        toast.error('Ошибка при загрузке данных');
        console.error(error);
      }
    };
    
    // Добавление новой валютной пары
    const addPair = () => {
      if (!newPair.value.from || !newPair.value.to) {
        toast.warning('Выберите валютные пары');
        return;
      }
      
      if (newPair.value.from === newPair.value.to) {
        toast.warning('Валюты не должны совпадать');
        return;
      }
      
      // Проверка на существование такой пары
      const exists = currencyPairs.value.some(
        pair => pair.from === newPair.value.from && pair.to === newPair.value.to
      );
      
      if (exists) {
        toast.warning('Такая валютная пара уже существует');
        return;
      }
      
      currencyPairs.value.push({
        id: Date.now(),
        from: newPair.value.from,
        to: newPair.value.to,
        fee: newPair.value.fee
      });
      
      toast.success('Валютная пара добавлена');
    };
    
    // Удаление валютной пары
    const removePair = (index) => {
      currencyPairs.value.splice(index, 1);
      toast.success('Валютная пара удалена');
    };
    
    // Обновление валютной пары
    const updatePair = async (pair) => {
      try {
        // Здесь должен быть запрос к API для сохранения
        // await fetch(`/api/pairs/${pair.id}`, { method: 'PUT', body: JSON.stringify(pair) });
        toast.success('Изменения сохранены');
      } catch (error) {
        toast.error('Ошибка при сохранении');
        console.error(error);
      }
    };
    
    // Добавление новых лимитов
    const addLimit = () => {
      if (!newLimit.value.currency) {
        toast.warning('Выберите валюту');
        return;
      }
      
      if (newLimit.value.min >= newLimit.value.max) {
        toast.warning('Минимальный объем должен быть меньше максимального');
        return;
      }
      
      // Проверка на существование лимитов для этой валюты
      const exists = volumeLimits.value.some(
        limit => limit.currency === newLimit.value.currency
      );
      
      if (exists) {
        toast.warning('Лимиты для этой валюты уже установлены');
        return;
      }
      
      volumeLimits.value.push({
        id: Date.now(),
        currency: newLimit.value.currency,
        min: newLimit.value.min,
        max: newLimit.value.max
      });
      
      toast.success('Лимиты добавлены');
    };
    
    // Удаление лимитов
    const removeLimit = (index) => {
      volumeLimits.value.splice(index, 1);
      toast.success('Лимиты удалены');
    };
    
    // Обновление лимитов
    const updateLimit = async (limit) => {
      if (limit.min >= limit.max) {
        toast.warning('Минимальный объем должен быть меньше максимального');
        return;
      }
      
      try {
        // Здесь должен быть запрос к API для сохранения
        // await fetch(`/api/limits/${limit.id}`, { method: 'PUT', body: JSON.stringify(limit) });
        toast.success('Изменения сохранены');
      } catch (error) {
        toast.error('Ошибка при сохранении');
        console.error(error);
      }
    };
    
    // Сохранение всех изменений
    const saveAll = async () => {
      try {
        // Здесь должен быть запрос к API для сохранения всех данных
        // await fetch('/api/fees-and-limits', { method: 'POST', body: JSON.stringify({ pairs: currencyPairs.value, limits: volumeLimits.value }) });
        toast.success('Все изменения сохранены');
      } catch (error) {
        toast.error('Ошибка при сохранении');
        console.error(error);
      }
    };
    
    // Загрузка данных при монтировании компонента
    onMounted(() => {
      loadData();
    });
    
    return {
      availableCurrencies,
      currencyPairs,
      volumeLimits,
      newPair,
      newLimit,
      addPair,
      removePair,
      updatePair,
      addLimit,
      removeLimit,
      updateLimit,
      saveAll
    };
  }
};
</script>

<style scoped>
.fees-and-limits {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

h4 {
  margin: 20px 0 15px;
  color: #555;
}

.pair-item, .limit-item {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pair-info, .limit-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.btn-remove {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #cc0000;
}

.form-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-add, .btn-save {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-end;
  height: fit-content;
}

.btn-add:hover, .btn-save:hover {
  background: #45a049;
}

.btn-save {
  background: #2196F3;
  padding: 12px 20px;
  font-size: 16px;
}

.btn-save:hover {
  background: #0b7dda;
}

.actions {
  text-align: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-group {
    min-width: 100%;
  }
}
</style>