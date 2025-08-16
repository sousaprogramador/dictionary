import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WordCard from '../WordCard';

const hoisted = vi.hoisted(() => ({
  detail: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  entriesService: { detail: hoisted.detail },
}));

const renderWithClient = (ui: React.ReactElement) => {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.detail.mockReset();
});

describe('WordCard', () => {
  it('renderiza placeholder quando não houver palavra', () => {
    renderWithClient(<WordCard word={null} onPrev={() => {}} onNext={() => {}} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Meanings')).toBeInTheDocument();
  });

  it('busca detalhes e exibe fonética e significados', async () => {
    hoisted.detail.mockResolvedValue({
      phonetics: [{ text: '/test/', audio: 'https://audio.example/a.mp3' }],
      meanings: [
        { partOfSpeech: 'noun', definitions: [{ definition: 'def 1' }] },
        { partOfSpeech: 'verb', definitions: [{ definition: 'def 2' }] },
      ],
    });

    renderWithClient(<WordCard word="apple" onPrev={() => {}} onNext={() => {}} />);

    await waitFor(() => expect(hoisted.detail).toHaveBeenCalledWith('apple'));
    expect(await screen.findByText('apple')).toBeInTheDocument();
    expect(await screen.findByText('/test/')).toBeInTheDocument();
    expect(screen.getByText(/noun/)).toBeInTheDocument();
    expect(screen.getByText(/def 1/)).toBeInTheDocument();
    expect(screen.getByText(/verb/)).toBeInTheDocument();
    expect(screen.getByText(/def 2/)).toBeInTheDocument();
  });

  it('toca áudio ao clicar no botão Play quando houver URL', async () => {
    hoisted.detail.mockResolvedValue({
      phonetics: [{ text: '/t/', audio: 'https://audio.example/a.mp3' }],
      meanings: [],
    });

    const playSpy = vi.fn();
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: playSpy,
    });

    renderWithClient(<WordCard word="sound" onPrev={() => {}} onNext={() => {}} />);

    await waitFor(() => expect(hoisted.detail).toHaveBeenCalled());
    await waitFor(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement | null;
      expect(audio).not.toBeNull();
    });

    const btn = await screen.findByRole('button', { name: 'Play' });
    fireEvent.click(btn);
    expect(playSpy).toHaveBeenCalled();
  });

  it('dispara callbacks de navegação', async () => {
    hoisted.detail.mockResolvedValue({ phonetics: [], meanings: [] });

    const prev = vi.fn();
    const next = vi.fn();
    renderWithClient(<WordCard word="go" onPrev={prev} onNext={next} />);

    fireEvent.click(screen.getByText('Voltar'));
    fireEvent.click(screen.getByText('Próximo'));
    expect(prev).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
