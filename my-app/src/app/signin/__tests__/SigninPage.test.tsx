import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SigninPage from '../page';

const hoisted = vi.hoisted(() => ({
  router: { push: vi.fn() },
  signin: vi.fn(),
  me: vi.fn(),
  setToken: vi.fn(),
  dispatch: vi.fn(),
  resolve: undefined as undefined | ((v: any) => void),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => hoisted.router,
}));

vi.mock('@/lib/api-client', () => ({
  authService: { signin: hoisted.signin },
  userService: { me: hoisted.me },
}));

vi.mock('@/lib/cookies', () => ({
  setToken: hoisted.setToken,
}));

vi.mock('@/store', () => ({
  useAppDispatch: () => hoisted.dispatch,
}));

vi.mock('@/store/authSlice', () => ({
  setCredentials: (payload: any) => ({ type: 'auth/setCredentials', payload }),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  hoisted.router.push.mockClear();
  hoisted.signin.mockReset();
  hoisted.me.mockReset();
  hoisted.setToken.mockReset();
  hoisted.dispatch.mockReset();
  hoisted.resolve = undefined;
});

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'a@a.com' } });
  fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'secret' } });
};

describe('SigninPage', () => {
  it('loga, salva token, carrega usuário, despacha credenciais e redireciona', async () => {
    hoisted.signin.mockResolvedValue({ token: 'Bearer xyz' });
    hoisted.me.mockResolvedValue({ id: 1, name: 'Alice' });

    render(<SigninPage />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(hoisted.signin).toHaveBeenCalledWith('a@a.com', 'secret'));
    expect(hoisted.setToken).toHaveBeenCalledWith('xyz');
    await waitFor(() => expect(hoisted.me).toHaveBeenCalled());
    await waitFor(() =>
      expect(hoisted.dispatch).toHaveBeenCalledWith({
        type: 'auth/setCredentials',
        payload: { token: 'xyz', user: { id: 1, name: 'Alice' } },
      }),
    );
    await waitFor(() => expect(hoisted.router.push).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('Credenciais inválidas.')).toBeNull();
  });

  it('mostra erro quando login falha e não navega', async () => {
    hoisted.signin.mockRejectedValue(new Error('bad'));

    render(<SigninPage />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => expect(screen.getByText('Credenciais inválidas.')).toBeInTheDocument());
    expect(hoisted.setToken).not.toHaveBeenCalled();
    expect(hoisted.router.push).not.toHaveBeenCalled();
    expect(hoisted.dispatch).not.toHaveBeenCalled();
  });

  it('desabilita botão durante loading e volta ao normal após concluir', async () => {
    hoisted.signin.mockImplementation(
      () =>
        new Promise((resolve) => {
          hoisted.resolve = resolve;
        }),
    );
    hoisted.me.mockResolvedValue({ id: 2, name: 'B' });

    render(<SigninPage />);
    fillForm();

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Entrar');
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Entrando…');

    hoisted.resolve?.({ token: 'Bearer ttt' });
    await waitFor(() => expect(hoisted.setToken).toHaveBeenCalledWith('ttt'));
    await waitFor(() => expect(btn).not.toBeDisabled());
    expect(btn).toHaveTextContent('Entrar');
  });
});
