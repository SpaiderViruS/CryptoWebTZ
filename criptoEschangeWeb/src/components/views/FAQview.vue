<template>
  <div class="faq">
    <h2>FAQ</h2>
    <p>Ответы на часто задаваемые вопросы.</p>

    <div class="question">
      <h3>Почему заявка на обмен может обрабатываться с задержкой?</h3>
      <p>
        В некоторых случаях обработка заявки может занимать больше времени — например,
        при ручной проверке оператором, технических работах или высокой нагрузке на сеть.
        Если вы видите, что заявка долго не подтверждается — не переживайте, она в процессе.
        Вы всегда можете уточнить статус у поддержки.
      </p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.faq {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question {
  margin-top: 24px;
}

.question h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #333;
}

.question p {
  line-height: 1.5;
  color: #555;
}
</style>
