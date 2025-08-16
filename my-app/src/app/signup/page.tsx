'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, userService } from '@/lib/api-client';
import { setToken } from '@/lib/cookies';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await authService.signup(name, email, password);
      const token = (r.token || '').replace(/^Bearer\s+/, '');
      setToken(token);
      const me = await userService.me();
      dispatch(setCredentials({ token, user: me }));
      router.push('/');
    } catch {
      setError('Falha ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <form
        onSubmit={onSubmit}
        className='w-full max-w-md bg-white rounded-2xl shadow p-8 space-y-4'
      >
        <h1 className='text-2xl font-semibold'>Criar conta</h1>

        <input
          className='w-full rounded-lg border px-4 py-2'
          placeholder='nome'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className='w-full rounded-lg border px-4 py-2'
          placeholder='email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='w-full rounded-lg border px-4 py-2'
          placeholder='senha'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className='text-red-600 text-sm'>{error}</div>}

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-lg bg-sky-700 text-white py-2 font-semibold disabled:opacity-60'
        >
          {loading ? 'Enviando...' : 'Registrar'}
        </button>

        <p className='text-center text-sm'>
          Já tem uma conta?{' '}
          <Link href='/signin' className='text-sky-700 hover:underline'>
            entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
