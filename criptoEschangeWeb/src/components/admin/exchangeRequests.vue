<template>
  <div class="exchange-requests">
    <h1>Заявки на обмен</h1>
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <div v-for="request in requests" :key="request.id" class="request-card">
        <div class="request-header">
          <span>Заявка №{{ request.id }}</span>
          <span class="status" :class="request.status">{{ request.status }}</span>
        </div>
        <div class="request-details">
          <p><strong>Отдаете:</strong> {{ request.sell_amount }} {{ request.sell_currency }}</p>
          <p><strong>Получаете:</strong> {{ request.buy_amount }} {{ request.buy_currency }}</p>
          <p><strong>Адрес кошелька:</strong> {{ request.wallet_address }}</p>
          <p><strong>Телефон:</strong> {{ request.phone }}</p>
          <p><strong>Дата создания:</strong> {{ formatDate(request.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
const $api = inject('$api');

const requests = ref([]);
const loading = ref(true);

// Загрузка заявок
const fetchRequests = async () => {
  try {
    const response = await $api.$get('/exchangeReq/');
    requests.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Ошибка при загрузке заявок:', error);
  } finally {
    loading.value = false;
  }
};

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.exchange-requests {
  padding: 20px;
}

.request-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.новая {
  background-color: #ffeb3b;
}

.status.в_обработке {
  background-color: #2196f3;
  color: white;
}

.status.завершена {
  background-color: #4caf50;
  color: white;
}

.request-details p {
  margin: 4px 0;
}
</style>