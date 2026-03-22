'use client';

import Link from 'next/link';
import { GENRES } from '@/lib/constants';

export default function GenreFilter({ genres }: { genres?: string[] }) {
  const list = genres?.length ? genres : GENRES;
  return (
    <section>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-primary rounded-full inline-block" />
        Browse by Genre
      </h2>
      <div className="flex flex-wrap gap-2">
        {list.slice(0, 30).map((g) => (
          <Link
            key={g}
            href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
            className="text-sm px-3 py-1.5 rounded-full bg-card border border-border text-gray-300 hover:text-white hover:border-primary hover:bg-primary/10 transition-all"
          >
            {g}
          </Link>
        ))}
      </div>
    </section>
  );
}
