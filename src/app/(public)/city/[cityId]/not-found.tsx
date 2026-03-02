import Link from 'next/link';
import { Container } from '@/components/ui';

export default function CityNotFound() {
  return (
    <Container className="py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-4xl">&#x1F5FA;&#xFE0F;</span>
        <h2 className="text-xl font-semibold text-white">City not found</h2>
        <p className="text-sm text-zinc-400">
          We don&apos;t have that city yet. Check out our trending cities instead.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Back to home
        </Link>
      </div>
    </Container>
  );
}
