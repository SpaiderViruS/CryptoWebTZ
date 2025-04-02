<template> 
  <div class="exchange-form">
    <h2 class="form-title">Форма заявки</h2>

    <!-- Валюта продажи -->
    <v-select
      v-model="sellCurrency"
      label="Валюта, которую продаете"
      :items="sellCurrencies"
      item-title="value_full"
      item-value="id"
      variant="outlined"
      :loading="loading"
      :disabled="loading"
      @update:modelValue="handleSellCurrencyChange"
      class="form-field"
    ></v-select>

    <!-- Сумма продажи -->
    <v-text-field
      label="Количество"
      v-model.number="sellAmount"
      @input="calculateBuyAmount"
      variant="underlined"
      :error-messages="sellAmountError"
      type="number"
      :min="currentPair?.fee.min_amount"
      :max="currentPair?.fee.max_amount"
      class="form-field"
    ></v-text-field>

    <div v-if="currentPair" class="limits">
      Лимиты: {{ currentPair.fee.min_amount }} - {{ currentPair.fee.max_amount }}
    </div>

    <!-- Валюта покупки -->
    <v-select
      v-model="buyCurrency"
      label="Валюта, которую покупаете"
      :items="buyCurrencies"
      item-title="value_full"
      item-value="id"
      variant="outlined"
      :disabled="!sellCurrency || loading"
      @update:modelValue="handleBuyCurrencyChange"
      class="form-field"
    ></v-select>

    <!-- Сумма покупки -->
    <v-text-field
      label="Количество"
      v-model.number="buyAmount"
      @input="calculateSellAmount"
      variant="underlined"
      :error-messages="buyAmountError"
      type="number"
      class="form-field"
    ></v-text-field>

    <!-- Информация о курсе -->
    <div v-if="currentPair" class="rate-info">
      <div>Курс: 1 {{ sellCurrencySymbol }} = {{ currentPair.fee.commission }} {{ buyCurrencySymbol }}</div>
      <div>Комиссия: {{ currentPair.fee.commission }}%</div>
    </div>

    <!-- Дополнительные поля -->
    <v-text-field
      label="Адрес кошелька"
      v-model="walletAddress"
      :rules="walletRules"
      class="form-field"
    ></v-text-field>

    <v-text-field
      label="Телефон"
      v-model="phone"
      :rules="phoneRules"
      class="form-field"
    ></v-text-field>

    <!-- Управление -->
    <v-btn 
      @click="submitForm"
      :loading="submitting"
      :disabled="!formValid"
      class="submit-btn"
    >
      Отправить заявку
    </v-btn>

    <!-- Уведомления -->
    <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
    <v-alert v-if="success" type="success" class="mt-3">Заявка успешно отправлена!</v-alert>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();
const $api = inject('$api');

const loading = ref(true);
const submitting = ref(false);
const currencies = ref([]);
const pairs = ref([]);
const sellCurrency = ref(null);
const buyCurrency = ref(null);
const sellAmount = ref('');
const buyAmount = ref('');
const walletAddress = ref('');
const phone = ref('');
const error = ref('');
const success = ref(false);
const sellAmountError = ref('');
const buyAmountError = ref('');

const walletRules = [
  v => !!v.trim() || 'Обязательное поле',
  v => validateWalletAddress(v)
];
const phoneRules = [
  v => !!v.trim() || 'Обязательное поле',
  v => /^\+?[0-9]{10,15}$/.test(v) || 'Неверный формат'
];

const sellCurrencies = computed(() => {
  const sellIds = [...new Set(pairs.value.map(p => p.sell_currency))];
  return currencies.value.filter(c => sellIds.includes(c.id));
});

const buyCurrencies = computed(() => {
  if (!sellCurrency.value) return [];
  const allowedPairs = pairs.value.filter(p => p.sell_currency === sellCurrency.value);
  const allowedBuyIds = allowedPairs.map(p => p.buy_currency);
  return currencies.value.filter(c => allowedBuyIds.includes(c.id));
});

const currentPair = computed(() => 
  pairs.value.find(p => 
    p.sell_currency === sellCurrency.value && 
    p.buy_currency === buyCurrency.value
  )
);

const formValid = computed(() => {
  return currentPair.value &&
         sellAmount.value >= currentPair.value.fee.min_amount &&
         sellAmount.value <= currentPair.value.fee.max_amount &&
         walletAddress.value &&
         phone.value.match(/^\+?[0-9]{10,15}$/);
});

const loadData = async () => {
  try {
    const [cRes, pRes] = await Promise.all([
      $api.get('/dictionary/currencys'),
      $api.get('/curency_pair/')
    ]);

    currencies.value = cRes.data.data.map(c => ({
      ...c,
      type: c.value_short === 'RUB' ? 'fiat' : 'crypto'
    }));

    pairs.value = pRes.data.map(p => {
      const buy = currencies.value.find(c => c.value_short === p.buy_currency);
      const sell = currencies.value.find(c => c.value_short === p.sell_currency);

      return {
        id: p.id,
        is_active: p.is_active,
        icon: p.icon,
        created_at: p.created_at,
        updated_at: p.updated_at,
        sell_currency: sell?.id,
        buy_currency: buy?.id,
        fee: {
          commission: parseFloat(p.commission),
          min_amount: parseFloat(p.min_amount),
          max_amount: parseFloat(p.max_amount)
        }
      };
    });

  } catch (err) {
    toast.error('Ошибка загрузки данных');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const calculateBuyAmount = () => {
  if (!currentPair.value || !sellAmount.value) return;
  const { commission, min_amount, max_amount } = currentPair.value.fee;
  if (sellAmount.value < min_amount) {
    sellAmountError.value = `Минимальная сумма: ${min_amount}`;
    buyAmount.value = '';
    return;
  }
  if (sellAmount.value > max_amount) {
    sellAmountError.value = `Максимальная сумма: ${max_amount}`;
    buyAmount.value = '';
    return;
  }
  sellAmountError.value = '';
  const rate = 1 - commission / 100;
  buyAmount.value = (sellAmount.value * rate).toFixed(8);
};

const calculateSellAmount = () => {
  if (!currentPair.value || !buyAmount.value) return;
  const { commission, min_amount, max_amount } = currentPair.value.fee;
  const rate = 1 - commission / 100;
  const calculatedSell = buyAmount.value / rate;
  sellAmount.value = calculatedSell.toFixed(2);
  if (calculatedSell < min_amount) {
    sellAmountError.value = `Минимальная сумма: ${min_amount}`;
  } else if (calculatedSell > max_amount) {
    sellAmountError.value = `Максимальная сумма: ${max_amount}`;
  } else {
    sellAmountError.value = '';
  }
};

const handleSellCurrencyChange = () => {
  buyCurrency.value = null;
  sellAmount.value = '';
  buyAmount.value = '';
  sellAmountError.value = '';
  buyAmountError.value = '';
};

const handleBuyCurrencyChange = () => {
  sellAmount.value = '';
  buyAmount.value = '';
  sellAmountError.value = '';
  buyAmountError.value = '';
};

const validateWalletAddress = (address) => {
  const currency = currencies.value.find(c => c.id === buyCurrency.value);
  if (!currency) return true;
  switch(currency.value_short) {
    case 'USDT_TRC20': return /^T\w{33}$/.test(address);
    case 'BTC': return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    default: return true;
  }
};

const submitForm = async () => {
  submitting.value = true;
  try {
    const sell = currencies.value.find(c => c.id === sellCurrency.value);
    const buy = currencies.value.find(c => c.id === buyCurrency.value);

    await $api.post('/exchangeReq', {
      currency_pair_id: currentPair.value.id,
      sellAmount: sellAmount.value,
      buyAmount: buyAmount.value,
      walletAddress: walletAddress.value,
      phone: phone.value,
      sell_currency: sell?.value_short,
      buy_currency: buy?.value_short
    });

    toast.success('Заявка успешно отправлена!');
    resetForm();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Ошибка отправки');
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  sellCurrency.value = null;
  buyCurrency.value = null;
  sellAmount.value = '';
  buyAmount.value = '';
  walletAddress.value = '';
  phone.value = '';
};

onMounted(loadData);
</script>

<style scoped>
.exchange-form {
  max-width: 540px;
  margin: 3rem auto;
  padding: 2.5rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form-field {
  margin-bottom: 1rem;
}
a
.submit-btn {
  margin-top: 1rem;
  padding: 0.75rem;
  font-weight: bold;
  font-size: 1rem;
}

.rate-info {
  background-color: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #374151;
}

.limits {
  font-size: 0.9rem;
  color: #888;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}
</style>