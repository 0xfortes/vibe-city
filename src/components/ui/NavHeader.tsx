import Link from 'next/link';
import { Container } from './Container';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NavAuthButtons } from './NavAuthButtons';

export async function NavHeader() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-white">Vibe</span>
            <span className="text-zinc-400">CITY</span>
          </Link>
          <NavAuthButtons user={user} />
        </div>
      </Container>
    </header>
  );
}
