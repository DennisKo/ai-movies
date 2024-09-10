import { z } from 'zod';

export const GetPosterSchema = z.object({
  title: z.string().describe('The title of the movie'),
  description: z.string().describe('The description of the movie'),
});

type GetPosterType = z.infer<typeof GetPosterSchema>;

export async function getPoster(args: GetPosterType) {
  const { title, description } = args;

  const poster = await fetch(
    `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${title}`,
  );

  if (poster.ok) {
    const posterJson = await poster.json();

    return {
      poster: posterJson.Poster || 'https://placehold.co/400x600',
      title,
      description,
      imdbUrl: posterJson.imdbID
        ? `https://m.imdb.com/title/${posterJson.imdbID}`
        : `https://www.google.com/search?q=${title}+imdb`,
    };
  }

  return {
    poster: 'https://placehold.co/400x600',
    title,
    description,
    imdbUrl: `https://www.google.com/search?q=${title}+imdb`,
  };
}
