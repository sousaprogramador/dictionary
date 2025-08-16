import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DictionaryShell from '../DictionaryShell';
import * as api from '@/lib/api-client';

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('DictionaryShell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza lista inicial de palavras e seleciona a primeira', async () => {
    vi.spyOn(api.entriesService, 'list').mockResolvedValue({
      results: ['one', 'two'],
      hasNext: false,
      hasPrev: false,
    } as any);
    vi.spyOn(api.entriesService, 'detail').mockResolvedValue([{ phonetics: [], meanings: [] }]);
    vi.spyOn(api.userService, 'favorites').mockResolvedValue({ results: [] });

    renderWithClient(<DictionaryShell />);
    await waitFor(() => expect(screen.getByText(/"one"/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'one' })).toHaveAttribute('aria-current', 'true');
  });

  it('permite navegar para próximo e anterior', async () => {
    vi.spyOn(api.entriesService, 'list').mockResolvedValue({
      results: ['first', 'second'],
      hasNext: false,
      hasPrev: false,
    } as any);
    vi.spyOn(api.entriesService, 'detail').mockResolvedValue([{ phonetics: [], meanings: [] }]);
    vi.spyOn(api.userService, 'favorites').mockResolvedValue({ results: [] });

    renderWithClient(<DictionaryShell />);
    await waitFor(() => expect(screen.getByText(/"first"/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Próximo'));
    await waitFor(() => expect(screen.getByText(/"second"/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Voltar'));
    await waitFor(() => expect(screen.getByText(/"first"/)).toBeInTheDocument());
  });

  it('salva e remove favoritos', async () => {
    vi.spyOn(api.entriesService, 'list').mockResolvedValue({
      results: ['favword'],
      hasNext: false,
      hasPrev: false,
    } as any);
    vi.spyOn(api.entriesService, 'detail').mockResolvedValue([{ phonetics: [], meanings: [] }]);
    const favSpy = vi.spyOn(api.entriesService, 'favorite').mockResolvedValue(undefined as any);
    const unfavSpy = vi.spyOn(api.entriesService, 'unfavorite').mockResolvedValue(undefined as any);

    const favsMock = vi
      .spyOn(api.userService, 'favorites')
      .mockResolvedValueOnce({ results: [] })
      .mockResolvedValue({ results: [{ word: 'favword' }] });

    renderWithClient(<DictionaryShell />);
    await waitFor(() => expect(screen.getByText(/"favword"/)).toBeInTheDocument());

    fireEvent.click(screen.getByText('Salvar favorito'));
    await waitFor(() => expect(favSpy).toHaveBeenCalled());

    await waitFor(() => expect(favsMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText('Remover favorito')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Remover favorito'));
    await waitFor(() => expect(unfavSpy).toHaveBeenCalled());
  });

  it('faz busca por palavra', async () => {
    const list = vi.spyOn(api.entriesService, 'list');
    list.mockResolvedValue({
      results: ['alpha', 'beta'],
      hasNext: false,
      hasPrev: false,
    } as any);
    vi.spyOn(api.entriesService, 'detail').mockResolvedValue([{ phonetics: [], meanings: [] }]);
    vi.spyOn(api.userService, 'favorites').mockResolvedValue({ results: [] });

    renderWithClient(<DictionaryShell />);
    await waitFor(() => expect(screen.getByText(/"alpha"/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'beta' } });
    fireEvent.click(screen.getByText('Go'));

    await waitFor(() =>
      expect(list).toHaveBeenCalledWith('beta', 20, { next: undefined, prev: undefined }),
    );
  });
});
