'use client';

type Props = { active: 'list' | 'fav'; onChange: (t: 'list' | 'fav') => void };

export default function Tabs({ active, onChange }: Props) {
  return (
    <div className='mb-2 flex gap-2'>
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1 rounded border text-sm ${
          active === 'list' ? 'bg-gray-100' : ''
        }`}
      >
        Word list
      </button>
      <button
        onClick={() => onChange('fav')}
        className={`px-3 py-1 rounded border text-sm ${
          active === 'fav' ? 'bg-gray-100' : ''
        }`}
      >
        Favorites
      </button>
    </div>
  );
}
