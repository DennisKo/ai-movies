import { Card, CardContent } from '@/components/ui/card';

export async function Movie({
  title,
  description,
  poster,
  imdbUrl,
}: {
  title: string;
  description: string;
  poster: string;
  imdbUrl: string;
}) {
  return (
    <div
      key={title}
      className="opacity-0 animate-fade-in"
      style={{
        // animationDelay: `2 * 100}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <Card
        key={title}
        className="overflow-hidden hover:scale-105 transition-all"
      >
        <a href={imdbUrl} target="_blank">
          <div className="relative aspect-[3/4] md:aspect-[2/3] w-full ">
            <img
              src={poster}
              alt={`${title} poster`}
              className="object-fill w-full h-[500px]"
              height={500}
            />
          </div>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-3 text-white">{title}</h2>
            <p className="text-sm text-slate-300 line-clamp-3">{description}</p>
          </CardContent>
        </a>
      </Card>
    </div>
  );
}
