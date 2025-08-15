import http from '@/lib/http';

export const authService = {
  signin: (email: string, password: string) =>
    http.post('/auth/signin', { email, password }).then((r) => r.data),
  signup: (name: string, email: string, password: string) =>
    http.post('/auth/signup', { name, email, password }).then((r) => r.data),
};
