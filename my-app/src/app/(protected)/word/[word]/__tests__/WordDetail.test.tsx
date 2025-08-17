import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import WordDetail from '../page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const hoisted = vi.hoisted(() => ({
  detail: vi.fn(),
  favorite: vi.fn(),
  unfavorite: vi.fn(),
  useParams: vi.fn(),
  back: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  entriesService: {
    detail: hoisted.detail,
    favorite: hoisted.favorite,
    unfavorite: hoisted.unfavorite,
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => hoisted.useParams(),
  useRouter: () => ({ back: hoisted.back }),
}));

const renderWithRQ = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.detail.mockReset();
  hoisted.favorite.mockReset();
  hoisted.unfavorite.mockReset();
  hoisted.back.mockReset();
  hoisted.useParams.mockReset();
});

describe('WordDetail', () => {
  it('renderiza dados do verbete e botões', async () => {
    hoisted.useParams.mockReturnValue({ word: encodeURIComponent('apple') });
    hoisted.detail.mockResolvedValue([
      {
        word: 'apple',
        phonetics: [{ text: '/ˈæp.l̩/' }, { text: '/apl/', audio: 'https://a/u.mp3' }],
        meanings: [
          { partOfSpeech: 'noun', definitions: [{ definition: 'def 1', example: 'ex 1' }] },
          { partOfSpeech: 'verb', definitions: [{ definition: 'def 2' }] },
        ],
      },
    ]);

    renderWithRQ(<WordDetail />);

    await waitFor(() => expect(hoisted.detail).toHaveBeenCalledWith('apple'));

    expect(screen.getByRole('heading', { level: 2, name: 'apple' })).toBeInTheDocument();
    expect(await screen.findByText('/ˈæp.l̩/')).toBeInTheDocument();
    expect(screen.getByText('noun')).toBeInTheDocument();
    expect(screen.getByText('def 1 — ex 1')).toBeInTheDocument();
    expect(screen.getByText('verb')).toBeInTheDocument();
    expect(screen.getByText('def 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(await screen.findAllByText('Favorite')).toHaveLength(1);
    expect(await screen.findAllByText('Unfavorite')).toHaveLength(1);
  });

  it('aciona favorite, unfavorite e voltar', async () => {
    hoisted.useParams.mockReturnValue({ word: encodeURIComponent('banana') });
    hoisted.detail.mockResolvedValue([
      {
        word: 'banana',
        phonetics: [],
        meanings: [{ partOfSpeech: 'n.', definitions: [{ definition: 'x' }] }],
      },
    ]);

    renderWithRQ(<WordDetail />);

    await waitFor(() => expect(hoisted.detail).toHaveBeenCalledWith('banana'));

    const favBtn = await screen.findByRole('button', { name: 'Favorite' });
    fireEvent.click(favBtn);
    expect(hoisted.favorite).toHaveBeenCalledWith('banana');

    const unfavBtn = await screen.findByRole('button', { name: 'Unfavorite' });
    fireEvent.click(unfavBtn);
    expect(hoisted.unfavorite).toHaveBeenCalledWith('banana');

    const backBtn = screen.getByRole('button', { name: 'Voltar' });
    fireEvent.click(backBtn);
    expect(hoisted.back).toHaveBeenCalled();
  });
});
