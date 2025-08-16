import SearchBar from '@/components/SearchBar';
import InfiniteWords from '@/components/InfiniteWords';

export default function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || '';
  return (
    <div className='grid gap-4'>
      <SearchBar initialQuery={q} />
      <InfiniteWords search={q} limit={30} />
    </div>
  );
}
