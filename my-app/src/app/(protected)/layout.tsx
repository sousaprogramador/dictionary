import Header from '@/components/Header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='page'>
      <Header />
      <main className='container' style={{ paddingTop: 18 }}>
        {children}
      </main>
    </div>
  );
}
