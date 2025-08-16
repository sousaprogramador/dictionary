'use client';
import Cookies from 'js-cookie';

const KEY = 'token';

export const getToken = () => Cookies.get(KEY) || '';
export const setToken = (token: string) =>
  Cookies.set(KEY, token, { sameSite: 'lax' });
export const clearToken = () => Cookies.remove(KEY);
