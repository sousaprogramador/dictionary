import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import AudioPlayer from '../AudioPlayer';

const defineSpeech = () => {
  class FakeUtterance {
    text = '';
    lang = '';
    onend: (() => void) | null = null;
    constructor(text: string) {
      this.text = text;
    }
  }
  const cancel = vi.fn();
  const speak = vi.fn((u: any) => {
    u.onend?.();
  });
  Object.defineProperty(global, 'SpeechSynthesisUtterance', {
    value: FakeUtterance,
    configurable: true,
  });
  Object.defineProperty(window, 'speechSynthesis', {
    value: { cancel, speak },
    configurable: true,
  });
  return { cancel, speak };
};

const mockAudio = () => {
  const play = vi.fn().mockResolvedValue(undefined);
  const pause = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, 'play', { value: play, configurable: true });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', { value: pause, configurable: true });
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    get() {
      return (this as any).__ct || 0;
    },
    set(v: number) {
      (this as any).__ct = v;
    },
    configurable: true,
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    get() {
      return (this as any).__dur ?? 3.5;
    },
    set(v: number) {
      (this as any).__dur = v;
    },
    configurable: true,
  });
  return { play, pause };
};

const triggerLoadedMetadata = () => {
  const audio = document.querySelector('audio') as HTMLAudioElement;
  if (audio) {
    (audio as any).__dur = 3.5;
    act(() => {
      audio.dispatchEvent(new Event('loadedmetadata'));
    });
  }
};

const triggerTimeUpdate = (time: number) => {
  const audio = document.querySelector('audio') as HTMLAudioElement;
  if (audio) {
    audio.currentTime = time;
    act(() => {
      audio.dispatchEvent(new Event('timeupdate'));
    });
  }
};

const triggerEnded = () => {
  const audio = document.querySelector('audio') as HTMLAudioElement;
  if (audio) {
    act(() => {
      audio.dispatchEvent(new Event('ended'));
    });
  }
};

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('usa áudio quando houver URL nos fonemas', async () => {
    const { play } = mockAudio();
    render(<AudioPlayer word="hello" phonetics={[{ audio: 'https://example.com/a.mp3' }]} />);
    triggerLoadedMetadata();
    const btn = screen.getByRole('button', { name: /play/i });
    fireEvent.click(btn);
    expect(play).toHaveBeenCalled();
  });

  it('faz fallback para TTS quando não houver URL', () => {
    const { cancel, speak } = defineSpeech();
    render(<AudioPlayer word="world" phonetics={[]} />);
    const btn = screen.getByRole('button', { name: /play/i });
    fireEvent.click(btn);
    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalled();
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect((utterance as any).text).toBe('world');
  });

  it('atualiza posição via slider quando há áudio', () => {
    mockAudio();
    render(<AudioPlayer word="seek" phonetics={[{ audio: 'https://example.com/a.mp3' }]} />);
    triggerLoadedMetadata();
    const input = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.25' } });
    expect(parseFloat(input.value)).toBeCloseTo(1.25);
    triggerTimeUpdate(1.25);
    expect(parseFloat(input.value)).toBeCloseTo(1.25);
  });

  it('reseta estado ao trocar a palavra', () => {
    mockAudio();
    const { rerender } = render(
      <AudioPlayer word="first" phonetics={[{ audio: 'https://example.com/a.mp3' }]} />,
    );
    triggerLoadedMetadata();
    const input = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2' } });
    expect(parseFloat(input.value)).toBeCloseTo(2);
    rerender(<AudioPlayer word="second" phonetics={[{ audio: 'https://example.com/a.mp3' }]} />);
    triggerLoadedMetadata();
    const input2 = screen.getByRole('slider') as HTMLInputElement;
    expect(parseFloat(input2.value)).toBe(0);
  });

  it('altera estado playing ao terminar o áudio', () => {
    mockAudio();
    render(<AudioPlayer word="end" phonetics={[{ audio: 'https://example.com/a.mp3' }]} />);
    triggerLoadedMetadata();
    const btn = screen.getByRole('button', { name: /play/i });
    fireEvent.click(btn);
    triggerEnded();
    expect(btn.className.includes('pulse')).toBe(false);
  });
});
