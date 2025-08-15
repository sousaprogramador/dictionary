'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/store/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signin, hydrate, token } = useAuth();
  const router = useRouter();
  useEffect(() => {
    hydrate();
    if (token) router.replace('/');
  }, [hydrate, token, router]);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const d = await authService.signin(email, password);
      signin(d.token, d.name);
      router.replace('/');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className='grid min-h-screen place-items-center p-6'>
      <form
        onSubmit={onSubmit}
        className='w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow'
      >
        <h1 className='text-xl font-semibold'>Entrar</h1>
        {error && (
          <p className='rounded bg-red-50 p-2 text-sm text-red-700'>{error}</p>
        )}
        <input
          className='w-full rounded border p-2'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='w-full rounded border p-2'
          type='password'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className='w-full rounded bg-black p-2 text-white disabled:opacity-50'
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
