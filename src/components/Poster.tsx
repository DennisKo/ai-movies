'use client';

import Image from 'next/image';

export function Poster({ poster }: { poster: string }) {
  return (
    <Image
      src={poster || 'https://placehold.co/400x500'}
      alt="poster"
      width={300}
      height={200}
    />
  );
}
