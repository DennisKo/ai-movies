import { z } from 'zod';

export const MovieResponse = z.object({
  movies: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      poster: z.string(),
      imdbUrl: z.string(),
    }),
  ),
});
