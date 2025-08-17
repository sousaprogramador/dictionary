import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from '../page';

const hoisted = vi.hoisted(() => ({
  router: { push: vi.fn() },
  signup: vi.fn(),
  me: vi.fn(),
  setToken: vi.fn(),
  dispatch: vi.fn(),
  resolve: undefined as undefined | ((v: any) => void),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => hoisted.router,
}));

vi.mock('@/lib/api-client', () => ({
  authService: { signup: hoisted.signup },
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
  hoisted.signup.mockReset();
  hoisted.me.mockReset();
  hoisted.setToken.mockReset();
  hoisted.dispatch.mockReset();
  hoisted.resolve = undefined;
});

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText('nome'), { target: { value: 'Alice' } });
  fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'a@a.com' } });
  fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'secret' } });
};

describe('SignupPage', () => {
  it('registra, salva token, carrega usuário, despacha credenciais e redireciona', async () => {
    hoisted.signup.mockResolvedValue({ token: 'Bearer abc123' });
    hoisted.me.mockResolvedValue({ id: 7, name: 'Alice' });

    render(<SignupPage />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(hoisted.signup).toHaveBeenCalledWith('Alice', 'a@a.com', 'secret'));
    expect(hoisted.setToken).toHaveBeenCalledWith('abc123');
    await waitFor(() => expect(hoisted.me).toHaveBeenCalled());
    await waitFor(() =>
      expect(hoisted.dispatch).toHaveBeenCalledWith({
        type: 'auth/setCredentials',
        payload: { token: 'abc123', user: { id: 7, name: 'Alice' } },
      }),
    );
    await waitFor(() => expect(hoisted.router.push).toHaveBeenCalledWith('/'));
    expect(screen.queryByText('Falha ao cadastrar.')).toBeNull();
  });

  it('mostra erro quando signup falha e não navega', async () => {
    hoisted.signup.mockRejectedValue(new Error('bad'));

    render(<SignupPage />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(screen.getByText('Falha ao cadastrar.')).toBeInTheDocument());
    expect(hoisted.setToken).not.toHaveBeenCalled();
    expect(hoisted.router.push).not.toHaveBeenCalled();
    expect(hoisted.dispatch).not.toHaveBeenCalled();
  });

  it('desabilita botão durante loading e volta ao normal após concluir', async () => {
    hoisted.signup.mockImplementation(
      () =>
        new Promise((resolve) => {
          hoisted.resolve = resolve;
        }),
    );
    hoisted.me.mockResolvedValue({ id: 1, name: 'A' });

    render(<SignupPage />);
    fillForm();

    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Registrar');
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Registrando…');

    hoisted.resolve?.({ token: 'Bearer ttt' });
    await waitFor(() => expect(hoisted.setToken).toHaveBeenCalledWith('ttt'));
    await waitFor(() => expect(btn).not.toBeDisabled());
    expect(btn).toHaveTextContent('Registrar');
  });
});
