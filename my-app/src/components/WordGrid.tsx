'use client';

export default function WordGrid({
  words,
  selected,
  onSelect,
  className,
}: {
  words: string[];
  selected: string | null;
  onSelect: (w: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className ?? ''}`}>
      {words.map((w) => (
        <button
          key={w}
          onClick={() => onSelect(w)}
          className={`rounded border px-3 py-2 text-left hover:bg-gray-50 ${
            selected === w ? 'ring-2 ring-sky-500' : ''
          }`}
        >
          {w}
        </button>
      ))}
    </div>
  );
}
