import { create } from 'zustand';

export const useUi = create<{
  tab: 'list' | 'history' | 'favorites';
  setTab: (t: 'list' | 'history' | 'favorites') => void;
}>((set) => ({
  tab: 'list',
  setTab: (t) => set({ tab: t }),
}));
