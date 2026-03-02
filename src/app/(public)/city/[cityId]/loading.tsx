import { Container, Skeleton } from '@/components/ui';

export default function CityLoading() {
  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8">
        {/* City header */}
        <div className="flex flex-col gap-2">
          <Skeleton variant="text" className="h-10 w-48" />
          <Skeleton variant="text" className="h-5 w-72" />
        </div>

        {/* Mood chips */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-10 w-28 rounded-full" />
          ))}
        </div>

        {/* Vibe score card */}
        <Skeleton variant="card" className="h-64" />

        {/* Debate messages */}
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton variant="avatar" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton variant="text" className="w-32" />
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
