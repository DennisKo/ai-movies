'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export function MovieSearch({
  setMovies,
}: {
  setMovies: (movies: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchWithSuggestion = async (
    e: React.MouseEvent<HTMLButtonElement>,
    suggestion: string,
  ) => {
    if (suggestion) {
      setMovies(suggestion);
    }
  };

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setMovies(inputRef.current?.value || '');
    }
  };
  const suggestions = [
    'Action movies',
    'With robots',
    'Like Apocalypse Now',
    'For kids',
  ];
  return (
    <div className="flex items-center justify-center min-h-screen  p-4">
      <div className="w-full max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          AI Movie Search 🤖 🍿
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-2 px-3 text-sm font-medium bg-slate-900  border-slate-600 text-foreground hover:border-slate-400 hover:text-foreground"
              onClick={(e) => handleSearchWithSuggestion(e, suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search for movies..."
            className="w-full pl-12 pr-4 py-6 text-xl rounded-full shadow-lg bg-slate-900 border-slate-700 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            onKeyDown={handleSearch}
            autoFocus
            ref={inputRef}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
