const env = process.env.NODE_ENV; // Получаем текущее окружение

const apiConfig = {
  development: 'http://localhost:3000', // API для разработки
  production: 'https://api.yourdomain.com', // API для продакшена
};

export const API_BASE_URL = apiConfig[env] || apiConfig.development; // По умолчанию development