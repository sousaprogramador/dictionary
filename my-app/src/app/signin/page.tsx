'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await authService.signin(email, password);
      const tok = String(res?.token || '').replace(/^Bearer\s+/i, '');
      Cookies.set('token', tok, { expires: 7, sameSite: 'lax' });
      router.replace(sp.get('next') || '/');
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='mx-auto max-w-sm px-4 py-10'>
      <h1 className='text-2xl font-semibold mb-6'>Entrar</h1>
      <form onSubmit={submit} className='space-y-4'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='email'
          className='w-full rounded border px-3 py-2'
          required
        />
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='senha'
          className='w-full rounded border px-3 py-2'
          required
        />
        {err ? <p className='text-red-600 text-sm'>{err}</p> : null}
        <button
          disabled={loading}
          className='w-full rounded bg-sky-600 text-white py-2 disabled:opacity-60'
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
