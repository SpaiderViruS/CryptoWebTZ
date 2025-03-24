<template>
  <div id="admin">
    <adminSlideBar />
  </div>
</template>

<script setup>
import adminSlideBar from './adminSlideBar.vue';
</script>

<style scoped>
#admin {
  display: flex;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  box-sizing: border-box;
}
</style>