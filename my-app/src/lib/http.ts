import axios from 'axios';

const http = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE });

http.interceptors.request.use((c) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) c.headers.Authorization = t;
  }
  return c;
});

export default http;
