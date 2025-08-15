import http from '@/lib/http';

export type Me = { id: string; name: string; email: string };
export type Row = { word: string; added: string };
export type Paged<T> = {
  results: T[];
  totalDocs?: number;
  page?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
};

export const userService = {
  me: () => http.get<Me>('/user/me').then((r) => r.data),
  history: (page = 1, limit = 25) =>
    http
      .get<Paged<Row>>('/user/me/history', { params: { page, limit } })
      .then((r) => r.data),
  favorites: (page = 1, limit = 25) =>
    http
      .get<Paged<Row>>('/user/me/favorites', { params: { page, limit } })
      .then((r) => r.data),
};
