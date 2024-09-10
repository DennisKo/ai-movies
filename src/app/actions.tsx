'use server';

import OpenAI from 'openai';
import { JSONSchema } from 'openai/lib/jsonschema.mjs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { zodResponseFormat } from 'openai/helpers/zod';
import { MovieResponse } from '@/lib/schema';
import { Message } from 'ai';
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { Movie } from '@/components/Movie';
import MovieGridSkeleton from '@/components/movie-grid-skeleton';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { MovieGrid } from '@/components/movie-grid';
import { getPoster, GetPosterSchema } from '@/lib/getPoster';
import { zodParseJSON } from '@/lib/utils';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

export async function getMovies(messages: Message[], usedMovies: string) {
  'use server';
  const gridUI = createStreamableUI(<MovieGridSkeleton />);
  const movieUI = createStreamableUI(null);
  const movieState = createStreamableValue('loading');
  const movieCache = createStreamableValue(usedMovies);

  const newMessages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'Get 4 similar movies for given a query. Return the title, description, poster URL and imdb url for each movie. Its important to return exactly 4 movies. Do not include movies that are already in the cache (if there are any).',
    },
    ...messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];
  const stream = await client.beta.chat.completions.runTools({
    model: 'gpt-4o-mini',
    messages: newMessages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'getPoster',
          function: getPoster,
          parse: zodParseJSON(GetPosterSchema),
          parameters: zodToJsonSchema(GetPosterSchema) as JSONSchema,
          description: 'Get the poster for a movie',
        },
      },
    ],
    stream: true,
    response_format: zodResponseFormat(MovieResponse, 'movie_response'),
  });

  const readableStream = stream.toReadableStream();
  let tempContent = '';
  let isFirstItem = false;
  let itemIndex = 0;
  let itemContent = '';
  const items: {
    title: string;
    description: string;
    poster: string;
    imdbUrl: string;
  }[] = [];
  const pipeStream = readableStream.pipeThrough(
    new TransformStream({
      transform(chunk) {
        const text = new TextDecoder().decode(chunk);
        const json = JSON.parse(text);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) {
          if (delta === `":[`) {
            isFirstItem = true;
            tempContent = tempContent + delta;
          } else if (delta === `{"`) {
            if (isFirstItem) {
              itemContent += delta;
            }
          } else if (delta === `"},{"`) {
            tempContent += `"}`;
            itemContent += `"}`;

            items.push(JSON.parse(itemContent));

            if (itemIndex === 0) {
              movieCache.append(`"${items[itemIndex].title}",`);
              movieUI.update(<Movie {...items[itemIndex]} />);
              gridUI.update(<MovieGrid movies={movieUI.value} />);
              movieState.update('movies');
            } else {
              movieCache.append(`"${items[itemIndex].title}",`);
              movieUI.append(<Movie {...items[itemIndex]} />);
              gridUI.update(<MovieGrid movies={movieUI.value} />);
            }
            itemIndex++;
            tempContent = `,{"`;
            itemContent = `{"`;
          } else if (delta === `"}`) {
            itemContent += delta;
            tempContent += delta;

            items.push(JSON.parse(itemContent));
            movieCache.append(`"${items[itemIndex].title}"`);
            movieUI.append(<Movie {...items[itemIndex]} />);
            gridUI.done(<MovieGrid movies={movieUI.value} />);
            movieUI.done();
            movieState.done('done');
            movieCache.done();
            itemIndex++;
            itemContent = '';
          } else {
            tempContent += delta;
            if (isFirstItem) {
              itemContent += delta;
            }
          }
        }
      },
    }),
  );

  pipeStream.getReader().read();

  return {
    component: gridUI.value,
    state: movieState.value,
    movieCache: movieCache.value,
  };
}
