import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InfiniteWords from '../InfiniteWords';

const hoisted = vi.hoisted(() => ({
  list: vi.fn(),
  routerMock: { replace: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => hoisted.routerMock,
  useSearchParams: () => ({ get: (_: string) => null }),
}));

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true }),
}));

vi.mock('@/lib/api-client', () => ({
  entriesService: { list: hoisted.list },
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('InfiniteWords', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    hoisted.routerMock.replace.mockClear();
    hoisted.list.mockReset();
  });

  it('renderiza primeira página e carrega a próxima quando em view', async () => {
    hoisted.list.mockImplementation((_q: string, _l: number, cursor?: { next?: string }) => {
      if (!cursor?.next) {
        return Promise.resolve({
          results: ['a', 'b'],
          next: 'c2',
          previous: undefined,
          hasNext: true,
          hasPrev: false,
          totalDocs: 3,
        });
      }
      return Promise.resolve({
        results: ['c'],
        next: undefined,
        previous: 'c1',
        hasNext: false,
        hasPrev: true,
        totalDocs: 3,
      });
    });

    renderWithClient(<InfiniteWords />);

    await waitFor(() => {
      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('b')).toBeInTheDocument();
      expect(screen.getByText('c')).toBeInTheDocument();
    });

    expect(hoisted.list).toHaveBeenCalledTimes(2);
  });

  it('atualiza busca e URL ao digitar', async () => {
    hoisted.list.mockResolvedValue({
      results: ['alpha', 'beta'],
      next: undefined,
      previous: undefined,
      hasNext: false,
      hasPrev: false,
      totalDocs: 2,
    });

    renderWithClient(<InfiniteWords />);

    fireEvent.change(screen.getByPlaceholderText('Search word…'), {
      target: { value: 'term' },
    });

    await waitFor(() => {
      expect(hoisted.list).toHaveBeenCalledWith('term', 20, { next: undefined, prev: undefined });
      expect(hoisted.routerMock.replace).toHaveBeenCalled();
    });
  });

  it('altera limite e reflete no URL', async () => {
    hoisted.list.mockResolvedValue({
      results: ['x'],
      next: undefined,
      previous: undefined,
      hasNext: false,
      hasPrev: false,
      totalDocs: 1,
    });

    renderWithClient(<InfiniteWords />);

    fireEvent.change(screen.getByLabelText('Limit'), { target: { value: '15' } });

    await waitFor(() => {
      expect(hoisted.list).toHaveBeenCalledWith('', 15, { next: undefined, prev: undefined });
      expect(hoisted.routerMock.replace).toHaveBeenCalled();
    });
  });
});
