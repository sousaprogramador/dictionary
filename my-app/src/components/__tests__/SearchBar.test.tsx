import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

const hoisted = vi.hoisted(() => ({
  router: { replace: vi.fn() },
  state: { search: '' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => hoisted.router,
  useSearchParams: () => {
    const usp = new URLSearchParams(hoisted.state.search);
    return {
      get: (k: string) => usp.get(k),
      entries: () => usp.entries() as any,
    };
  },
}));

const getParamsFromReplace = () => {
  const call = hoisted.router.replace.mock.calls.at(-1)?.[0] as string;
  const qs = call.split('/?')[1] || '';
  return new URLSearchParams(qs);
};

describe('SearchBar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    hoisted.router.replace.mockClear();
    hoisted.state.search = '';
  });

  it('aplica busca e adiciona limit padrão ao clicar Go', () => {
    hoisted.state.search = 'foo=bar';
    render(<SearchBar />);
    fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('Go'));
    const p = getParamsFromReplace();
    expect(p.get('search')).toBe('hello');
    expect(p.get('limit')).toBe('20');
    expect(p.get('foo')).toBe('bar');
  });

  it('atualiza a query ao pressionar Enter', () => {
    hoisted.state.search = 'search=old&x=1';
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search…');
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const p = getParamsFromReplace();
    expect(p.get('search')).toBe('new');
    expect(p.get('x')).toBe('1');
  });

  it('remove o parâmetro search quando campo estiver vazio', () => {
    hoisted.state.search = 'search=keep&foo=1&limit=50';
    render(<SearchBar />);
    fireEvent.change(screen.getByPlaceholderText('Search…'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Go'));
    const p = getParamsFromReplace();
    expect(p.get('search')).toBeNull();
    expect(p.get('limit')).toBe('50');
    expect(p.get('foo')).toBe('1');
  });
});
