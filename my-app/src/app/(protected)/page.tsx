import DictionaryShell from '@/components/DictionaryShell';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/signin');
  return (
    <main>
      <DictionaryShell />
    </main>
  );
}
