import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default {
  install(app) {
    // Создаем экземпляр axios с базовым URL
    const api = axios.create({
      baseURL: API_BASE_URL,
    });

    api.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    api.$get = (url, config) => api.get(url, config);
    api.$post = (url, data, config) => api.post(url, data, config);
    api.$put = (url, data, config) => api.put(url, data, config);
    api.$delete = (url, config) => api.delete(url, config);

    // Добавляем $api в глобальный контекст Vue
    app.config.globalProperties.$api = api;
  },
};