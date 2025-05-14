<template>
    <div class="not-found">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <router-link to="/">Вернуться на главную</router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .not-found {
    text-align: center;
    margin-top: 100px;
  }
  
  .not-found h1 {
    font-size: 72px;
    color: #f44336;
  }
  
  .not-found p {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .not-found a {
    color: #42b983;
    font-weight: bold;
    text-decoration: none;
  }
  </style>
  