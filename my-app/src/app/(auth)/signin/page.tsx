'use client';
import { useState } from 'react';
import { authService, userService } from '@/lib/api-client';
import { setToken } from '@/lib/cookies';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Signin() {
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const qp = useSearchParams();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const r = await authService.signin(email, password);
      const token = (r.token || '').replace(/^Bearer\s+/, '');
      setToken(token);
      const me = await userService.me();
      dispatch(setCredentials({ token, user: me }));
      const to = qp.get('to') || '/';
      router.push(to);
    } catch {
      setError('Credenciais inválidas');
    }
  };
  return (
    <div className='card'>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} className='grid'>
        <input
          className='input'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className='input'
          placeholder='Senha'
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className='badge'>{error}</div>}
        <button className='btn' type='submit'>
          Entrar
        </button>
      </form>
    </div>
  );
}
