import { CitySearch } from './CitySearch';

export function HeroSection() {
  return (
    <section className="flex flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
        Vibe<span className="text-zinc-400">CITY</span>
      </h1>
      <p className="max-w-lg text-lg text-zinc-400">
        5 AI agents debate what you should do tonight. Pick a city. Watch the chaos.
      </p>
      <CitySearch />
    </section>
  );
}
