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

        // Функция для ограничения чисел до 3 знаков после запятой
        const sanitizeNumber = (num) => {
          if (typeof num !== 'number') num = Number(num) || 0;
          return parseFloat(num.toFixed(5));
        };

        // Обрабатываем валюты
        if (Array.isArray(currenciesResponse.data.data)) {
          availableCurrencies.value = currenciesResponse.data.data;
          
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
                commission: sanitizeNumber(fee.commission),
                min_amount: sanitizeNumber(fee.min_amount),
                max_amount: sanitizeNumber(fee.max_amount)
              }
            };
          });
        }

      } catch (error) {
        toast.error('Ошибка загрузки данных');
        console.error('Ошибка загрузки:', error);
      }
    };

    const addPair = async () => {
      try {
        const pair = newPair.value;

        // Обязательные поля
        const requiredFields = [
          { field: pair.sell_currency, message: 'Выберите валюту продажи' },
          { field: pair.buy_currency, message: 'Выберите валюту покупки' },
          { field: pair.commission, message: 'Введите комиссию' },
          { field: pair.min_amount, message: 'Введите минимальную сумму' },
          { field: pair.max_amount, message: 'Введите максимальную сумму' }
        ];

        for (const { field, message } of requiredFields) {
          if (field === undefined || field === null || field === '') {
            toast.warning(message);
            return;
          }
        }

        // Числовые поля
        const numericFields = [
          { value: pair.commission, name: 'Комиссия' },
          { value: pair.min_amount, name: 'Минимальная сумма' },
          { value: pair.max_amount, name: 'Максимальная сумма' }
        ];

        for (const { value, name } of numericFields) {
          if (isNaN(value) || String(value).trim() === '') {
            toast.warning(`${name} должна быть числом`);
            return;
          }
          if (Number(value) < 0) {
            toast.warning(`${name} не может быть отрицательной`);
            return;
          }
        }

        if (Number(pair.min_amount) >= Number(pair.max_amount)) {
          toast.warning('Минимальный лимит должен быть меньше максимального');
          return;
        }

        if (Number(pair.sell_currency) === Number(pair.buy_currency)) {
          toast.warning('Валюты должны отличаться');
          return;
        }

        // Получение валют и пар
        const { data: currencies } = await $api.$get('/dictionary/currencys');
        const { data: serverPairs } = await $api.$get('/curency_pair/');

        const currencyMap = new Map(currencies.data.map(c => [c.value_short, c.id]));
        const targetSellId = Number(pair.sell_currency);
        const targetBuyId = Number(pair.buy_currency);

        // === Разрешаем обратную, запрещаем дубликат в том же направлении ===
        const isDuplicate = serverPairs.some(p => {
          const pairSellId = currencyMap.get(p.sell_currency);
          const pairBuyId = currencyMap.get(p.buy_currency);
          return pairSellId === targetSellId && pairBuyId === targetBuyId;
        });

        if (isDuplicate) {
          toast.warning('Такая валютная пара уже существует');
          return;
        }

        // Создание пары
        const pairResponse = await $api.$post('/curency_pair/', {
          sell_currency: targetSellId,
          buy_currency: targetBuyId
        });

        // Создание лимитов
        await $api.$post('/fees_limit/', {
          currency_pair_id: pairResponse.data,
          commission: pair.commission,
          min_amount: pair.min_amount,
          max_amount: pair.max_amount
        });

        await loadData();
        toast.success('Пара добавлена успешно');

        newPair.value = {
          sell_currency: availableCurrencies.value[0]?.id || null,
          buy_currency: availableCurrencies.value[1]?.id || null,
          commission: 2.5,
          min_amount: 1000,
          max_amount: 500000
        };

      } catch (error) {
        console.error('Ошибка:', error);
        toast.error(error.response?.data?.message || 'Ошибка сервера');
      }
    };



      // Обновление лимитов
      const updateFeeLimit = async (pair) => {
        try {
          // Проверка существования fee и его id
          if (!pair.fee || !pair.fee.id) {
            toast.warning('Лимиты для этой пары не найдены');
            return;
          }

          // Проверка полей
          const requiredFields = [
            { value: pair.fee.commission, name: 'Комиссия' },
            { value: pair.fee.min_amount, name: 'Минимальная сумма' },
            { value: pair.fee.max_amount, name: 'Максимальная сумма' }
          ];

          // Проверка на пустые значения
          for (const field of requiredFields) {
            if (field.value === undefined || field.value === null || field.value === '') {
              toast.warning(`Заполните поле: ${field.name}`);
              return;
            }
          }

          // Проверка на валидные числа
          if (
            isNaN(pair.fee.commission) ||
            isNaN(pair.fee.min_amount) ||
            isNaN(pair.fee.max_amount)
          ) {
            toast.warning('Все поля должны быть числами');
            return;
          }

          // Приводим к числам
          const commission = Number(pair.fee.commission);
          const minAmount = Number(pair.fee.min_amount);
          const maxAmount = Number(pair.fee.max_amount);

          // Проверка минимального и максимального лимита
          if (minAmount >= maxAmount) {
            toast.warning('Минимальная сумма должна быть меньше максимальной');
            return;
          }

          // Проверка комиссии
          if (commission <= 0 || commission > 100) {
            toast.warning('Комиссия должна быть в диапазоне от 0 до 100%');
            return;
          }

          // Отправка запроса
          await $api.put(`/fees_limit/${pair.fee.id}`, {
            commission: commission,
            min_amount: minAmount,
            max_amount: maxAmount
          });

          toast.success('Изменения сохранены');
        } catch (error) {
          console.error('Детали ошибки:', {
            request: { id: pair.fee?.id, data: pair.fee },
            response: error.response?.data
          });
          toast.error(error.response?.data?.message || 'Ошибка обновления');
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