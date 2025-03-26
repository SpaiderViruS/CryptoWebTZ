<template>
  <div class="fees-and-limits">
    <h2>Управление валютными парами и лимитами</h2>
    
    <!-- Список валютных пар -->
    <div class="section">
      <h3>Валютные пары</h3>
      
      <div class="currency-pairs">
        <div v-for="pair in currencyPairs" :key="pair.id" class="pair-item">
          <div class="pair-info">
            <span>{{ pair.sell_currency }} → {{ pair.buy_currency }}</span>
            <button @click="removePair(pair)" class="btn-remove">×</button>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Комиссия (%)</label>
              <input 
                type="number" 
                v-model.number="pair.fee.commission" 
                min="0"
                step="0.01"
                @change="updateFeeLimit(pair)"
              >
            </div>
            
            <div class="form-group">
              <label>Мин. сумма</label>
              <input 
                type="number" 
                v-model.number="pair.fee.min_amount" 
                min="0"
                step="0.01"
                @change="updateFeeLimit(pair)"
              >
            </div>
            
            <div class="form-group">
              <label>Макс. сумма</label>
              <input 
                type="number" 
                v-model.number="pair.fee.max_amount" 
                min="0"
                step="0.01"
                @change="updateFeeLimit(pair)"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Форма добавления новой пары -->
      <div class="add-pair-form">
        <h4>Добавить новую пару</h4>
        <div class="form-group">
          <label>Отдаваемая валюта</label>
          <select v-model="newPair.sell_currency">
            <option 
              v-for="currency in availableCurrencies" 
              :key="currency.id" 
              :value="currency.id"
            >
              {{ currency.value_short }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Получаемая валюта</label>
          <select v-model="newPair.buy_currency">
            <option 
              v-for="currency in availableCurrencies" 
              :key="currency.id" 
              :value="currency.id"
            >
              {{ currency.value_short }}
            </option>
          </select>
        </div>
          
          <div class="form-group">
            <label>Комиссия (%)</label>
            <input 
              type="number" 
              v-model.number="newPair.commission" 
              min="0" 
              step="0.01"
            >
          </div>
          
          <div class="form-group">
            <label>Мин. сумма</label>
            <input 
              type="number" 
              v-model.number="newPair.min_amount" 
              min="0"
              step="0.01"
            >
          </div>
          
          <div class="form-group">
            <label>Макс. сумма</label>
            <input 
              type="number" 
              v-model.number="newPair.max_amount" 
              min="0"
              step="0.01"
            >
          </div>
          
          <button @click="addPair" class="btn-add">Добавить</button>
        </div>
      </div>
    </div>
</template>

<script>
import { ref, inject, onMounted } from 'vue';
import { useToast } from "vue-toastification";

export default {
  name: 'CurrencyPairsManager',
  setup() {
    const $api = inject('$api');
    const toast = useToast();
    
    const availableCurrencies = ref([]);
    const currencyPairs = ref([]);
    
    const newPair = ref({
      sell_currency: null,
      buy_currency: null,
      commission: 2.5,
      min_amount: 1000,
      max_amount: 500000
    });

    // Загрузка всех данных
    const loadData = async () => {
      try {
        // Загрузка валют из справочника
        const currenciesResponse = await $api.get('/dictionary/currencys');
        const [pairsResponse, feesResponse] = await Promise.all([
          $api.get('/curency_pair/'),
          $api.get('/fees_limit/')
        ]);

        // Обрабатываем валюты
        if (Array.isArray(currenciesResponse.data)) {
          availableCurrencies.value = currenciesResponse.data;
          
          // Устанавливаем начальные значения
          if (availableCurrencies.value.length >= 2) {
            newPair.value.sell_currency = availableCurrencies.value[0].id;
            newPair.value.buy_currency = availableCurrencies.value[1].id;
          }
        }

        // Обрабатываем пары
        if (Array.isArray(pairsResponse.data)) {
          currencyPairs.value = pairsResponse.data.map(pair => {
            const fee = feesResponse.data.find(f => f.currency_pair_id === pair.id) || {};
            return {
              ...pair,
              fee: {
                id: fee.id || null,
                commission: fee.commission || 0,
                min_amount: fee.min_amount || 0,
                max_amount: fee.max_amount || 0
              }
            };
          });
        }

      } catch (error) {
        toast.error('Ошибка загрузки данных');
        console.error('Ошибка загрузки:', error);
      }
    };

    // Добавление новой пары
    const addPair = async () => {
      try {
        // Проверки
        if (!newPair.value.sell_currency || !newPair.value.buy_currency) {
          toast.warning('Выберите обе валюты');
          return;
        }

        if (newPair.value.sell_currency === newPair.value.buy_currency) {
          toast.warning('Валюты должны отличаться');
          return;
        }

        // Проверка существующей пары
        const exists = currencyPairs.value.some(pair => 
          pair.sell_currency === newPair.value.sell_currency &&
          pair.buy_currency === newPair.value.buy_currency
        );

        if (exists) {
          toast.warning('Такая пара уже существует');
          return;
        }

        // Создание пары
        const pairResponse = await $api.post('/curency_pair/', {
          sell_currency: newPair.value.sell_currency,
          buy_currency: newPair.value.buy_currency
        });

        // Создание комиссий
        await $api.post('/fees_limit/', {
          currency_pair_id: pairResponse.data.id,
          commission: newPair.value.commission,
          min_amount: newPair.value.min_amount,
          max_amount: newPair.value.max_amount
        });

        await loadData();
        toast.success('Пара успешно добавлена');

        // Сброс значений
        if (availableCurrencies.value.length >= 2) {
          newPair.value.sell_currency = availableCurrencies.value[0].id;
          newPair.value.buy_currency = availableCurrencies.value[1].id;
        }
        newPair.value.commission = 2.5;
        newPair.value.min_amount = 1000;
        newPair.value.max_amount = 500000;

      } catch (error) {
        toast.error(error.response?.data || 'Ошибка при создании пары');
        console.error('Ошибка создания:', error);
      }
    };

    // Обновление лимитов
    const updateFeeLimit = async (pair) => {
      try {
        if (!pair.fee.id) {
          toast.warning('Лимиты для этой пары не найдены');
          return;
        }
        
        await $api.put('/fees_limit/', {
          id: pair.fee.id,
          currency_pair_id: pair.id,
          commission: pair.fee.commission,
          min_amount: pair.fee.min_amount,
          max_amount: pair.fee.max_amount
        });
        
        toast.success('Изменения сохранены');
      } catch (error) {
        toast.error('Ошибка сохранения изменений');
        console.error('Ошибка обновления:', error);
      }
    };

    // Удаление пары
    const removePair = async (pair) => {
      try {
        $api.delete(`/curency_pair/${pair.id}`);
        await loadData();
        toast.success('Пара удалена');
      } catch (error) {
        toast.error('Ошибка удаления пары');
        console.error('Ошибка удаления:', error);
      }
    };

    onMounted(loadData);

    return {
      availableCurrencies,
      currencyPairs,
      newPair,
      addPair,
      updateFeeLimit,
      removePair
    };
  }
};
</script>

<style scoped>
/* Сохраните оригинальные стили из предыдущего примера */
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

.pair-item {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pair-info {
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

.btn-add {
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

.btn-add:hover {
  background: #45a049;
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