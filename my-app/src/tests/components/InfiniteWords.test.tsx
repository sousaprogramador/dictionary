import { render, screen, fireEvent } from '@testing-library/react';
import InfiniteWords from '@/components/InfiniteWords';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const qc = new QueryClient();
const initial = {
  page: {
    results: ['alpha', 'beta'],
    totalDocs: 2,
    hasNext: false,
    hasPrev: false,
  },
  search: '',
};
test('renderiza itens iniciais e busca', async () => {
  render(
    <QueryClientProvider client={qc}>
      <InfiniteWords initial={initial as any} limit={2} />
    </QueryClientProvider>
  );
  expect(screen.getByText('alpha')).toBeInTheDocument();
  const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
});
