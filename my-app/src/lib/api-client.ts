'use client';
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = Cookies.get('token');
  cfg.headers = AxiosHeaders.from(cfg.headers);
  if (t) (cfg.headers as AxiosHeaders).set('Authorization', `Bearer ${t}`);
  return cfg;
});

export type CursorPage = {
  results: string[];
  totalDocs: number;
  next?: string;
  previous?: string;
  hasNext: boolean;
  hasPrev: boolean;
};

export const authService = {
  async signup(name: string, email: string, password: string) {
    const r = await apiClient.post('/auth/signup', { name, email, password });
    return r.data;
  },
  async signin(email: string, password: string) {
    const r = await apiClient.post('/auth/signin', { email, password });
    return r.data;
  },
};

export const entriesService = {
  async list(search: string, limit: number, cursor?: { next?: string; prev?: string }) {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (limit) p.set('limit', String(limit));
    if (cursor?.next) p.set('next', cursor.next);
    if (cursor?.prev) p.set('prev', cursor.prev);
    const r = await apiClient.get<CursorPage>('/entries/en', {
      params: Object.fromEntries(p),
    });
    return r.data;
  },
  async detail(word: string) {
    const r = await apiClient.get(`/entries/en/${encodeURIComponent(word)}`);
    return r.data;
  },
  async favorite(word: string) {
    await apiClient.post(`/entries/en/${encodeURIComponent(word)}/favorite`);
  },
  async unfavorite(word: string) {
    await apiClient.delete(`/entries/en/${encodeURIComponent(word)}/unfavorite`);
  },
};

export const userService = {
  async me() {
    const r = await apiClient.get('/user/me');
    return r.data;
  },
  async history(page: number, limit: number) {
    const r = await apiClient.get('/user/me/history', {
      params: { page, limit },
    });
    return r.data;
  },
  async favorites(page: number, limit: number) {
    const r = await apiClient.get('/user/me/favorites', {
      params: { page, limit },
    });
    return r.data;
  },
};
