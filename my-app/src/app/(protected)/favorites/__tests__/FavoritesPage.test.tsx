import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FavoritesPage from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const hoisted = vi.hoisted(() => ({
  favorites: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  userService: { favorites: hoisted.favorites },
}));

vi.mock('next/link', () => ({
  default: (props: any) => <a {...props} />,
}));

const renderWithRQ = (ui: React.ReactElement) => {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.favorites.mockReset();
});

describe('FavoritesPage', () => {
  it('chama a API com (1, 200) e renderiza os itens como links', async () => {
    hoisted.favorites.mockResolvedValue({
      results: [{ word: 'alpha' }, { word: 'bravo' }, { word: 'charlie' }],
    });

    renderWithRQ(<FavoritesPage />);

    await waitFor(() => expect(hoisted.favorites).toHaveBeenCalledWith(1, 200));
    const alpha = await screen.findByText('alpha');
    const bravo = await screen.findByText('bravo');
    const charlie = await screen.findByText('charlie');

    expect(alpha.closest('a')?.getAttribute('href')).toBe('/?search=alpha');
    expect(bravo.closest('a')?.getAttribute('href')).toBe('/?search=bravo');
    expect(charlie.closest('a')?.getAttribute('href')).toBe('/?search=charlie');
  });

  it('mostra título e lida com lista vazia', async () => {
    hoisted.favorites.mockResolvedValue({ results: [] });

    renderWithRQ(<FavoritesPage />);

    expect(screen.getByText('Favorites')).toBeInTheDocument();
    await waitFor(() => expect(hoisted.favorites).toHaveBeenCalled());
    expect(screen.queryByRole('link')).toBeNull();
  });
});
