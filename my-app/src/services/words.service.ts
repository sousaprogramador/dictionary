import http from '@/lib/http';

export type ListResp = {
  results: string[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const wordsService = {
  list: (page = 1, limit = 20, search = '') =>
    http
      .get<ListResp>('/entries/en', { params: { page, limit, search } })
      .then((r) => r.data),
  get: (word: string) =>
    http.get(`/entries/en/${encodeURIComponent(word)}`).then((r) => r.data),
  favorite: (word: string) =>
    http
      .post(`/entries/en/${encodeURIComponent(word)}/favorite`)
      .then((r) => r.data),
  unfavorite: (word: string) =>
    http
      .delete(`/entries/en/${encodeURIComponent(word)}/unfavorite`)
      .then((r) => r.data),
};
