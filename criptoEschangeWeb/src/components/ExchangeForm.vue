<template> 
  <div class="exchange-form">
    <h2 class="form-title">Форма заявки</h2>

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

    <v-text-field
      label="Количество"
      v-model.number="buyAmount"
      @input="calculateSellAmount"
      variant="underlined"
      :error-messages="buyAmountError"
      type="number"
      class="form-field"
    ></v-text-field>

    <div v-if="currentPair" class="rate-info">
      <div>Курс: 1 = {{ currentRateToShow.toFixed(4) }} {{ buyCurrencySymbol }}</div>
    </div>

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

    <v-btn 
      @click="submitForm"
      :loading="submitting"
      :disabled="!formValid"
      class="submit-btn"
    >
      Отправить заявку
    </v-btn>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
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
const sellAmountError = ref('');
const buyAmountError = ref('');
const exchangeRate = ref(1);

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

const formatToTwoDecimals = (num) => {
  return Math.floor(num * 100) / 100;
};

const currentRate = computed(() => {
  if (!currentPair.value) return 0;

  const commission = currentPair.value.fee?.commission || 0;
  const id = currentPair.value.id;

  let baseRate = 1;

  if (id === 2) {
    baseRate = 1 / exchangeRate.value;
  } else if (id === 1) {
    baseRate = exchangeRate.value;
  }

  const finalRate = baseRate * (1 - (commission / 2) / 100);
  return finalRate;
});


const currentRateToShow = computed(() => {
  if (!currentPair.value) return 0

  let baseRate = exchangeRate.value;

  const finalRate = baseRate;
  return finalRate;
});

const formValid = computed(() => {
  return currentPair.value &&
         walletAddress.value &&
         phone.value.match(/^\+?[0-9]{10,15}$/);
});

const loadData = async () => {
  try {
    const [cursRes, cRes, pRes] = await Promise.all([
      $api.get('/curs'),
      $api.get('/dictionary/currencys'),
      $api.get('/curency_pair/')
    ]);

    exchangeRate.value = parseFloat(cursRes.data?.rate);

    currencies.value = cRes.data.data;

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
  const { min_amount, max_amount } = currentPair.value.fee;
  const rate = currentRate.value;

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
  const result = sellAmount.value * rate;
  buyAmount.value = formatToTwoDecimals(result);
};

const calculateSellAmount = () => {
  if (!currentPair.value || !buyAmount.value) return;
  const { min_amount, max_amount } = currentPair.value.fee;
  const rate = currentRate.value;

  const result = buyAmount.value / rate;
  sellAmount.value = formatToTwoDecimals(result);

  if (result < min_amount) {
    sellAmountError.value = `Минимальная сумма: ${min_amount}`;
  } else if (result > max_amount) {
    sellAmountError.value = `Максимальная су  мма: ${max_amount}`;
  } else {
    sellAmountError.value = '';
  }
};

const handleSellCurrencyChange = () => {
  calculateSellAmount();
};

const handleBuyCurrencyChange = () => {
  calculateBuyAmount();
};

const validateWalletAddress = (address) => true;

const submitForm = async () => {
  submitting.value = true;

  let clientId = localStorage.getItem("client_id");
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem("client_id", clientId);
  }

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
      buy_currency: buy?.value_short,
      uuid: clientId  
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

<style>
  @media (max-width: 600px) {
    .v-input__control .v-field-label {
      font-size: 0.65rem !important;
      white-space: normal !important;
      overflow: visible !important;
      text-overflow: unset !important;
    }
  }

</style>

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

.v-input .v-label {
  white-space: normal !important;
  line-height: 1.2;
}

.v-input__control .v-field-label {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  line-height: 1.3;
  font-size: 0.9rem;
}

.limits {
  font-size: 0.9rem;
  color: #888;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}


</style>
