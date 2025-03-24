
<template>
  <div id="app">
    <navBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import navBar from './components/navBar.vue';

components: { navBar }
</script>
<style scoped>
header {
  line-height: 1.5;
}
#app {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

main {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  /* max-width: 1200px; */
  /* margin: 0 auto; */
  width: 100%;
  box-sizing: border-box;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
