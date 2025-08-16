'use client';
import Cookies from 'js-cookie';
export const getToken = () => Cookies.get('token') || '';
export const setToken = (t: string) => Cookies.set('token', t, { expires: 7 });
export const clearToken = () => Cookies.remove('token');
