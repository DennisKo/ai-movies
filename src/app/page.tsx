'use client';
import { track } from '@vercel/analytics';
import { MovieSearch } from '@/components/movie-search';
import { ReactNode, useState } from 'react';
import { getMovies } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from '@/components/ui/button';
import { generateId, Message } from 'ai';

const initialStreamedState = { value: '', id: '' };
type StreamedState = { value: string; id: string };

export default function Chat() {
  const [movies, setMovies] = useState<{ component: ReactNode; id: string }[]>(
    [],
  );

  const [movieState, setMovieState] =
    useState<StreamedState>(initialStreamedState);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setMessages] = useState<Message[]>([]);
  const [movieCache, setMovieCache] =
    useState<StreamedState>(initialStreamedState);

  const reset = () => {
    setMovies([]);
    setMovieState(initialStreamedState);
    setSearchQuery('');
    setMessages([]);
    setMovieCache(initialStreamedState);
  };

  const handleSearch = async (input: string) => {
    track('search', { input });
    const id = generateId();
    const movieUI = await getMovies(
      [
        {
          id: id,
          role: 'user' as const,
          content: `<query>${input}</query>
<movieCache>${movieCache.value}</movieCache>`,
        },
      ],
      movieCache.value,
    );
    setMessages((currMessages) => [
      ...currMessages,
      {
        id: id,
        role: 'user' as const,
        content: `<query>${input}</query>
<movieCache>${movieCache.value}</movieCache>`,
      },
    ]);
    setMovies((currMovies) => [
      ...currMovies,
      { component: movieUI.component, id: id },
    ]);
    setSearchQuery(input);
    for await (const delta of readStreamableValue(movieUI.state)) {
      setMovieState({ id, value: delta as string });
    }
    for await (const delta of readStreamableValue(movieUI.movieCache)) {
      setMovieCache({ id, value: delta as string });
    }
  };

  const loadMore = () => {
    handleSearch(searchQuery);
  };

  return (
    <div className="container mx-auto pb-20">
      {!movieState.id && <MovieSearch setMovies={handleSearch} />}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{searchQuery}</h1>
        {movies.map((movie) => (
          <div key={movie.id}>{movie.component}</div>
        ))}
        <div className="flex justify-center gap-4 px-4">
          {movieState.value === 'done' && movies.length < 3 && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={loadMore}
                className="px-8 md:px-12 py-6 text-xl md:text-2xl font-semibold bg-slate-900 hover:bg-primary/10 text-white border-2 border-slate-600 lg:mt-10"
              >
                Load More
              </Button>
            </div>
          )}
          {movieState.value === 'done' && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={reset}
                className="px-8 md:px-12 py-6 text-xl md:text-2xl font-semibold bg-slate-900 hover:bg-primary/10 text-white border-2 border-slate-600  lg:mt-10"
              >
                New search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
