import { create } from 'zustand';
import {
  userService,
  type Me,
  type Row,
  type Paged,
} from '@/services/user.service';

type S = {
  me: Me | null;
  history: Row[];
  favorites: Row[];
  hPage: number;
  fPage: number;
  hHasNext: boolean;
  fHasNext: boolean;
};
type A = {
  loadMe: () => Promise<void>;
  loadHistory: (page?: number, limit?: number) => Promise<void>;
  loadFavorites: (page?: number, limit?: number) => Promise<void>;
  reset: () => void;
};

export const useUserStore = create<S & A>((set) => ({
  me: null,
  history: [],
  favorites: [],
  hPage: 1,
  fPage: 1,
  hHasNext: false,
  fHasNext: false,
  loadMe: async () => {
    const data = await userService.me();
    set({ me: data });
  },
  loadHistory: async (page = 1, limit = 25) => {
    const data: Paged<Row> = await userService.history(page, limit);
    set({ history: data.results, hPage: page, hHasNext: !!data.hasNext });
  },
  loadFavorites: async (page = 1, limit = 25) => {
    const data: Paged<Row> = await userService.favorites(page, limit);
    set({ favorites: data.results, fPage: page, fHasNext: !!data.hasNext });
  },
  reset: () =>
    set({
      me: null,
      history: [],
      favorites: [],
      hPage: 1,
      fPage: 1,
      hHasNext: false,
      fHasNext: false,
    }),
}));
