'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { signout } from '@/store/authSlice';
import { clearToken } from '@/lib/cookies';

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const name = user?.name || 'Usuário';
  const initial = (name?.[0] || 'U').toUpperCase();

  const onLogout = () => {
    clearToken();
    dispatch(signout());
    router.replace('/signin');
  };

  return (
    <div className='appbar-wrap card' style={{ borderRadius: 0 }}>
      <header className='appbar'>
        <div className='brand'>Fullstack Dictionary</div>
        <div className='spacer' />
        <div className='user'>
          <div className='avatar' aria-hidden>
            {initial}
          </div>
          <span>{name}</span>
          <button className='btn btn-sm secondary' onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>
    </div>
  );
}
