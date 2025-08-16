'use client';
import { useState } from 'react';
import { authService, userService } from '@/lib/api-client';
import { setToken } from '@/lib/cookies';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/authSlice';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const r = await authService.signup(name, email, password);
      const token = (r.token || '').replace(/^Bearer\s+/, '');
      setToken(token);
      const me = await userService.me();
      dispatch(setCredentials({ token, user: me }));
      router.push('/');
    } catch {
      setError('Falha ao cadastrar');
    }
  };
  return (
    <div className='card'>
      <h2>Criar conta</h2>
      <form onSubmit={onSubmit} className='grid'>
        <input
          className='input'
          placeholder='Nome'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          Cadastrar
        </button>
      </form>
    </div>
  );
}
