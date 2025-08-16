// src/components/__tests__/WordGrid.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WordGrid from '../WordGrid';

const hoisted = vi.hoisted(() => ({
  list: vi.fn(),
  router: { push: vi.fn() },
  state: { search: '' },
  params: {
    get: (k: string) => new URLSearchParams((vi as any).hoisted?.state?.search ?? '').get(k),
    entries: () => new URLSearchParams((vi as any).hoisted?.state?.search ?? '').entries() as any,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => hoisted.router,
  useSearchParams: () => hoisted.params, // objeto estável entre renders
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

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.list.mockReset();
  hoisted.router.push.mockClear();
  hoisted.state.search = '';
});

describe('WordGrid', () => {
  it('carrega primeira e segunda páginas quando em view', async () => {
    hoisted.list.mockImplementation((_s: string, _l: number, cursor?: { next?: string }) => {
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

    renderWithClient(<WordGrid />);

    await waitFor(() => {
      expect(screen.getByText('a')).toBeInTheDocument();
      expect(screen.getByText('b')).toBeInTheDocument();
      expect(screen.getByText('c')).toBeInTheDocument();
    });

    expect(hoisted.list).toHaveBeenCalledTimes(2);
    expect(hoisted.list).toHaveBeenNthCalledWith(1, '', 24, { next: undefined, prev: undefined });
    expect(hoisted.list).toHaveBeenNthCalledWith(2, '', 24, { next: 'c2', prev: undefined });
  });

  it('submete busca e atualiza a URL', async () => {
    hoisted.list.mockResolvedValue({
      results: ['x', 'y'],
      next: undefined,
      previous: undefined,
      hasNext: false,
      hasPrev: false,
      totalDocs: 2,
    });

    renderWithClient(<WordGrid />);

    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'term' } });
    await waitFor(() => expect(input.value).toBe('term'));

    fireEvent.click(screen.getByText('Go'));

    await waitFor(() => {
      expect(hoisted.list).toHaveBeenCalledWith('term', 24, { next: undefined, prev: undefined });
      expect(hoisted.router.push).toHaveBeenCalled();
    });

    const url = hoisted.router.push.mock.calls.at(-1)?.[0] as string;
    const qs = url.split('/?')[1] ?? '';
    const params = new URLSearchParams(qs);
    expect(params.get('search')).toBe('term');
  });

  it('navega para a página da palavra ao clicar no chip', async () => {
    hoisted.list.mockResolvedValue({
      results: ['hello'],
      next: undefined,
      previous: undefined,
      hasNext: false,
      hasPrev: false,
      totalDocs: 1,
    });

    renderWithClient(<WordGrid />);

    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('hello'));

    expect(hoisted.router.push).toHaveBeenCalledWith('/word?word=hello');
  });
});
