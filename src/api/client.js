import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default client;

export async function apiHealth() {
  const { data } = await client.get('/api/v1/health');
  return data;
}
