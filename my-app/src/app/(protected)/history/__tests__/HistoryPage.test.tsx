import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HistoryPage from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const hoisted = vi.hoisted(() => ({
  history: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  userService: { history: hoisted.history },
}));

vi.mock('next/link', () => ({
  default: (props: any) => <a {...props} />,
}));

const renderWithRQ = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.history.mockReset();
});

describe('HistoryPage', () => {
  it('chama a API com (1, 50) e renderiza a lista com links e tempos relativos', async () => {
    hoisted.history.mockResolvedValue({
      results: [
        { word: 'alpha', added: '2024-01-01T10:00:00.000Z' },
        { word: 'bravo', added: '2024-01-02T12:30:00.000Z' },
      ],
    });

    renderWithRQ(<HistoryPage />);

    await waitFor(() => expect(hoisted.history).toHaveBeenCalledWith(1, 50));

    const alpha = await screen.findByText('alpha');
    const bravo = await screen.findByText('bravo');

    expect(alpha.closest('a')?.getAttribute('href')).toBe('/?search=alpha');
    expect(bravo.closest('a')?.getAttribute('href')).toBe('/?search=bravo');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    items.forEach((li) => {
      const spans = li.getElementsByTagName('span');
      expect(spans.length).toBeGreaterThan(0);
      expect(spans[0].textContent?.length).toBeGreaterThan(0);
    });
  });

  it('mostra título e lida com lista vazia', async () => {
    hoisted.history.mockResolvedValue({ results: [] });

    renderWithRQ(<HistoryPage />);

    expect(screen.getByText('History')).toBeInTheDocument();
    await waitFor(() => expect(hoisted.history).toHaveBeenCalled());
    expect(screen.queryByRole('listitem')).toBeNull();
  });
});
