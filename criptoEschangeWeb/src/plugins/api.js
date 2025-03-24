import axios from 'axios';
import { API_BASE_URL } from '../config/api'; // Импортируем конфиг

export default {
  install(app) {
    // Создаем экземпляр axios с базовым URL
    const api = axios.create({
      baseURL: API_BASE_URL,
    });

    // Добавляем методы для удобства
    api.$get = (url, config) => api.get(url, config);
    api.$post = (url, data, config) => api.post(url, data, config);
    api.$put = (url, data, config) => api.put(url, data, config);
    api.$delete = (url, config) => api.delete(url, config);

    // Добавляем $api в глобальный контекст Vue
    app.config.globalProperties.$api = api;
  },
};