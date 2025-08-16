'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, userService } from '@/lib/api-client';
import { setToken } from '@/lib/cookies';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const r = await authService.signin(email, password);
      const token = String(r.token || '').replace(/^Bearer\s+/i, '');
      setToken(token);
      const me = await userService.me();
      dispatch(setCredentials({ token, user: me }));
      router.push('/');
    } catch {
      setError('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='auth-shell'>
      <div className='auth-card'>
        <h1 className='auth-title'>Entrar</h1>

        <form className='auth-form' onSubmit={onSubmit}>
          <input
            className='input'
            placeholder='email'
            type='email'
            autoComplete='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className='input'
            placeholder='senha'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className='badge danger'>{error}</div>}

          <button className='btn' type='submit' disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className='auth-sub'>
          Ainda não tem uma conta?{' '}
          <Link className='link' href='/signup'>
            registre-se grátis
          </Link>
        </p>
      </div>
    </main>
  );
}
