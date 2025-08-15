import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Dictionary',
  description: 'Fullstack Challenge',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='pt-br'>
      <body className='min-h-screen bg-neutral-50 text-neutral-900'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
