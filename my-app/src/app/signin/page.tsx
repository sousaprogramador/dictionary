'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api-client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.signin(email, password);
      if (res?.token) {
        document.cookie = `token=${res.token.replace(
          /^Bearer\s+/,
          ''
        )}; path=/`;
      }
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow p-8'>
        <h1 className='text-2xl font-semibold mb-6'>Entrar</h1>

        <form onSubmit={onSubmit} className='space-y-4'>
          <input
            type='email'
            placeholder='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-600'
            required
          />
          <input
            type='password'
            placeholder='senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-sky-600'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-sky-700 text-white py-2 font-semibold disabled:opacity-60'
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className='mt-4 text-sm text-center text-gray-700'>
          Ainda nao tem uma conta?{' '}
          <Link href='/signup' className='text-sky-700 hover:underline'>
            registre-se gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
