import './assets/main.css'

import { createApp } from 'vue';
import App from './App.vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles' // Подключение стилей Vuetify
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import router from './router';
import apiPlugin from './plugins/api.js';

import Toast from "vue-toastification";
import 'vue-toastification/dist/index.css';

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App);
app.use(router);
app.use(vuetify)
app.use(apiPlugin);
app.use(Toast, {
  timeout: 3000, // Время показа (мс)
  position: 'top-right', // Позиция (top-right, bottom-left и т. д.)
  closeOnClick: true, // Закрывать по клику
  pauseOnFocusLoss: false, // Не останавливать таймер при потере фокуса
  pauseOnHover: true, // Пауза при наведении
  draggable: true, // Можно двигать мышкой
  draggablePercent: 0.6, // Процент для свайпа
  showCloseButtonOnHover: false, // Показывать кнопку закрытия при наведении
  hideProgressBar: false, // Скрыть полосу прогресса
  closeButton: 'button', // Тип кнопки закрытия ('button' или 'component')
  icon: true, // Показывать иконку
  rtl: false, // Справа налево (для арабского и т. д.)
});

app.provide('$api', app.config.globalProperties.$api);

app.mount('#app')

// createApp(App).mount('#app')
