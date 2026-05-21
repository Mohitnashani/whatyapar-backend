import axios from 'axios';

const api = axios.create({
// Change this:
// baseURL: 'http://localhost:5000/api',

// To this (using your actual Render URL):
baseURL: 'https://whatyapar-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const acceptOrder = async (id) => {
  const response = await api.put(`/orders/${id}/accept`);
  return response.data;
};

export default api;
