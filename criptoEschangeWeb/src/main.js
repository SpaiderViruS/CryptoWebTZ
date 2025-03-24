import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles' // Подключение стилей Vuetify
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import router from './router'
import apiPlugin from './plugins/api.js'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App);
app.use(router);
app.use(vuetify)
app.use(apiPlugin);

app.provide('$api', app.config.globalProperties.$api);

app.mount('#app')

// createApp(App).mount('#app')
