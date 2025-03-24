<template>
  <div class="exchange-form">
    <h2>Форма заявки</h2>

    <!-- Валюта, которую продаете -->
    <v-select
      v-model="sellCurrency"
      label="Валюта, которую продаете"
      :items="['Наличный RUB']"
      variant="outlined"
    ></v-select>

    <!-- Количество продаваемой валюты -->
    <v-text-field
      label="Количество"
      v-model="sellAmount"
      @input="calculateBuyAmount"
      variant="underlined"
      :error-messages="sellAmountError"
    ></v-text-field>
    <div class="limits">
      Мин: {{ minSellAmount }}, Макс: {{ maxSellAmount }}
    </div>

    <!-- Валюта, которую покупаете -->
    <v-select
      v-model="buyCurrency"
      label="Валюта, которую покупаете"
      :items="['USDT TRC20']"
      variant="outlined"
    ></v-select>

    <!-- Количество покупаемой валюты -->
    <v-text-field
      label="Количество"
      v-model="buyAmount"
      @input="calculateSellAmount"
      variant="underlined"
      :error-messages="buyAmountError"
    ></v-text-field>
    <div class="limits">
      Мин: {{ minBuyAmount }}, Макс: {{ maxBuyAmount }}
    </div>

    <!-- Курс обмена -->
    <div class="exchange-rate">
      Курс обмена: 1 {{ sellCurrency }} = {{ exchangeRate }} {{ buyCurrency }}
    </div>

    <!-- Адрес кошелька -->
    <v-text-field
      label="Адрес кошелька"
      v-model="walletAddress"
      variant="underlined"
      :error-messages="walletAddressError"
    ></v-text-field>

    <!-- Телефон -->
    <v-text-field
      label="Телефон"
      v-model="phone"
      variant="underlined"
      :error-messages="phoneError"
    ></v-text-field>

    <!-- Кнопка отправки -->
    <v-btn @click="submitRequest" variant="outlined">Отправить заявку</v-btn>

    <!-- Сообщения об ошибках и успехе -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Заявка отправлена!</div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const $api = inject('$api');

// Данные формы
const sellCurrency = ref('Наличный RUB');
const buyCurrency = ref('USDT TRC20');
const sellAmount = ref(0);
const buyAmount = ref(0);
const walletAddress = ref('');
const phone = ref('');
const error = ref('');
const success = ref(false);

// Ошибки валидации
const sellAmountError = ref('');
const buyAmountError = ref('');
const walletAddressError = ref('');
const phoneError = ref('');

// Минимальные и максимальные объемы (можно загружать из админки)
const minSellAmount = ref(100);
const maxSellAmount = ref(100000);
const minBuyAmount = ref(10);
const maxBuyAmount = ref(10000);

// Курс обмена (можно загружать через API)
const exchangeRate = ref(0.013); // 1 RUB = 0.013 USDT

// Расчет суммы получаемой валюты
const calculateBuyAmount = () => {
  buyAmount.value = (sellAmount.value * exchangeRate.value).toFixed(2);
};

// Расчет суммы продаваемой валюты
const calculateSellAmount = () => {
  sellAmount.value = (buyAmount.value / exchangeRate.value).toFixed(2);
};

// Валидация формы
const validateForm = () => {
  let isValid = true;

  if (!sellAmount.value || sellAmount.value < minSellAmount.value || sellAmount.value > maxSellAmount.value) {
    sellAmountError.value = `Введите сумму от ${minSellAmount.value} до ${maxSellAmount.value}`;
    isValid = false;
  } else {
    sellAmountError.value = '';
  }

  if (!buyAmount.value || buyAmount.value < minBuyAmount.value || buyAmount.value > maxBuyAmount.value) {
    buyAmountError.value = `Введите сумму от ${minBuyAmount.value} до ${maxBuyAmount.value}`;
    isValid = false;
  } else {
    buyAmountError.value = '';
  }

  if (!walletAddress.value) {
    walletAddressError.value = 'Введите адрес кошелька';
    isValid = false;
  } else {
    walletAddressError.value = '';
  }

  if (!phone.value) {
    phoneError.value = 'Введите телефон';
    isValid = false;
  } else {
    phoneError.value = '';
  }

  return isValid;
};

// Отправка заявки
const submitRequest = async () => {
  if (!validateForm()) {
    error.value = 'Пожалуйста, заполните все поля корректно';
    return;
  }

  try {
    await $api.$post('/exchangeReq/', {
      sellAmount: sellAmount.value,
      buyAmount: buyAmount.value,
      walletAddress: walletAddress.value,
      phone: phone.value,
    });
    success.value = true;
    error.value = '';
  } catch (err) {
    error.value = 'Ошибка отправки заявки';
    console.log(err)
  }
};
</script>

<style scoped>
.exchange-form {
  border: 1px solid black;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.limits {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.exchange-rate {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>