import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_URLS = ['/api/v1/auth/', '/api/v1/health'];

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !AUTH_URLS.some((u) => error.config?.url?.includes(u))
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

export async function apiHealth() {
  const { data } = await client.get('/api/v1/health');
  return data;
}
