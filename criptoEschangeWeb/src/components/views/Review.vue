<template>
  <div class="reviews">
    <h2>Отзывы</h2>
    <p>Отзывы наших клиентов:</p>
    <ul>
      <li>Отличный сервис! Быстро и удобно.</li>
      <li>Все прошло гладко, спасибо!</li>
    </ul>
  </div>
</template>

<script setup>
name: 'Review'
</script>

<style scoped>
.reviews {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>