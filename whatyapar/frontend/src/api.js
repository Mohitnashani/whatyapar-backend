import axios from 'axios';

const api = axios.create({
  baseURL: 'https://whatyapar-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('whatyapar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createOrder = async (storeSlug, orderData) => {
  const response = await api.post(`/orders/${storeSlug}`, orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const acceptOrder = async (id, price = 0) => {
  const response = await api.put(`/orders/${id}/accept`, { price });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/orders/analytics');
  return response.data;
};

export default api;
