<template>
  <div class="reviews-wrapper">
    <div class="reviews">
      <h2>Отзывы клиентов</h2>

      <button class="open-review-btn" v-if="canReview && !showForm" @click="showForm = true">
        Оставить отзыв
      </button>

      <div class="review-form" v-if="showForm">
        <h3>Оставить отзыв</h3>
        <input v-model="review.author_name" placeholder="Ваше имя" />
        <textarea v-model="review.text" placeholder="Ваш отзыв..." />
        <select v-model="review.rating">
          <option disabled value="">Оценка</option>
          <option v-for="n in 6" :key="n" :value="n - 1">{{ n - 1 }} — {{ ratingText(n - 1) }}</option>
        </select>
        <button @click="submitReview">Отправить</button>
      </div>

      <p v-if="!canReview && uuid">Вы уже оставили все доступные отзывы.</p>

      <ul class="review-list">
        <li
          v-for="r in reviews"
          :key="r.id"
          :class="['review', `rating-${r.rating}`]"
        >
          <div class="review-header">
            <strong>{{ r.author_name }}</strong>
            <span>{{ formatDate(r.created_at) }}</span>
          </div>
          <p>{{ r.text }}</p>
          <small class="rating-label">Оценка: {{ r.rating }} — {{ ratingText(r.rating) }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { inject } from 'vue';

const $api = inject('$api');
const toast = useToast();

let clientId = localStorage.getItem('client_id');
if (!clientId) {
  clientId = crypto.randomUUID();
  localStorage.setItem('client_id', clientId);
}
const uuid = clientId;

const orders = ref([]);
const reviews = ref([]);
const canReview = ref(false);
const showForm = ref(false);

const review = ref({
  text: '',
  author_name: '',
  rating: '',
});

const loadReviews = async () => {
  const res = await $api.get('/review');
  reviews.value = res.data;

  const userReviews = reviews.value.filter(r => r.client_uuid === uuid);

  try {
      const resOrders = await $api.get(`/exchangeReq/${uuid}`);
      orders.value = Array.isArray(resOrders.data) ? resOrders.data : [];
      canReview.value = orders.value.length > userReviews.length;
  } catch (e) {
    canReview.value = false;
  }
};

const submitReview = async () => {
  if (!review.value.author_name || review.value.rating === '') {
    toast.error('Имя и оценка обязательны');
    return;
  }

  try {
    await $api.post('/review', {
      text: review.value.text,
      author_name: review.value.author_name,
      rating: review.value.rating,
      uuid,
    });
    toast.success('Отзыв добавлен');
    review.value = { text: '', author_name: '', rating: '' };
    showForm.value = false;
    await loadReviews();
  } catch (err) {
    toast.error(err.response?.data || 'Ошибка');
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const ratingText = (r) => {
  switch (+r) {
    case 0: return 'Ужасно';
    case 1: return 'Плохо';
    case 2: return 'Нормально';
    case 3: return 'Хорошо';
    case 4: return 'Очень хорошо';
    case 5: return 'Отлично';
    default: return '';
  }
};

onMounted(loadReviews);
</script>

<style scoped>
.reviews-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.open-review-btn {
  margin-bottom: 1rem;
  padding: 10px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.review-form {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.review-form input,
.review-form textarea,
.review-form select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.review-form button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.review-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.review {
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #333;
}
.rating-0 {
  background: #ff4d4f;
  color: white;
}
.rating-1 {
  background: #ff7a45;
  color: white;
}
.rating-2 {
  background: #ffa940;
  color: white;
}
.rating-3 {
  background: #ffc53d;
  color: #333;
}
.rating-4 {
  background: #bae637;
  color: #333;
}
.rating-5 {
  background: #73d13d;
  color: white;
}
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
</style>
