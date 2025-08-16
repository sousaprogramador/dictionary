import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

const routerMock = { replace: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}));

const mockDispatch = vi.fn();
let mockUser: any = { name: 'Mateus' };

vi.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => sel({ auth: { user: mockUser } }),
}));

const signoutRet = { type: 'auth/signout' };
vi.mock('@/store/authSlice', () => ({
  signout: () => signoutRet,
}));

const clearToken = vi.fn();
vi.mock('@/lib/cookies', () => ({
  clearToken: () => clearToken(),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerMock.replace.mockClear();
    mockUser = { name: 'Mateus' };
    mockDispatch.mockClear();
    clearToken.mockClear();
  });

  it('renderiza nome e inicial do usuário', () => {
    render(<Header />);
    expect(screen.getByText('Fullstack Dictionary')).toBeInTheDocument();
    expect(screen.getByText('Mateus')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('executa logout limpando token, disparando action e redirecionando', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(clearToken).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(signoutRet);
    expect(routerMock.replace).toHaveBeenCalledWith('/signin');
  });

  it('usa fallback de nome e inicial quando não houver usuário', () => {
    mockUser = null;
    render(<Header />);
    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
