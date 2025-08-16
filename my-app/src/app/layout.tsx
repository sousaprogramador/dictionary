import './globals.css';
import Providers from './providers';

export const metadata = { title: 'Dictionary' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-br'>
      <body className='min-h-screen bg-neutral-50 text-neutral-900'>
        <header className='h-14 bg-sky-600' />
        <Providers>
          <div className='mx-auto max-w-6xl px-4 py-5'>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
