<template>
  <div class="home">
    <!-- Первый блок: Лого, меню, описание, форма заявки -->
    <div class="hero-section">
      <div class="logo">
        <!-- <img src="@/assets/logo.png" alt="Логотип" /> -->
      </div>
      <h1>Офлайн-криптообменник</h1>
      <p class="description">
        Быстрый и безопасный обмен криптовалюты с гарантией лучшего курса.
      </p>
      <ExchangeForm />
    </div>

    <!-- Второй блок: FAQ -->
    <div class="faq-section">
      <h2>FAQ</h2>
      <div class="faq-list">
        <div class="faq-item">
          <h3>Как работает обмен?</h3>
          <p>
            Вы выбираете валюту, которую хотите обменять, и валюту, которую хотите получить. Мы предоставляем лучший курс и гарантируем безопасность сделки.
          </p>
        </div>
        <div class="faq-item">
          <h3>Какие валюты поддерживаются?</h3>
          <p>
            Мы поддерживаем обмен наличных RUB на USDT TRC20. В будущем добавим больше валют.
          </p>
        </div>
        <div class="faq-item">
          <h3>Сколько времени занимает обмен?</h3>
          <p>
            Обычно обмен занимает от 5 до 15 минут, в зависимости от загруженности сети.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExchangeForm from '@/components/ExchangeForm.vue';
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.logo img {
  max-width: 150px;
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 20px;
}

.faq-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.faq-section h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.faq-item h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.faq-item p {
  font-size: 1rem;
  color: #666;
}
</style>