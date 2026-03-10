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
    <header className="glass-surface sticky top-0 z-50 border-b border-white/[0.04]">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-lg tracking-tight">
            <span className="font-light text-white/70">Vibe</span>
            <span className="gradient-text font-bold">CITY</span>
          </Link>
          <NavAuthButtons user={user} />
        </div>
      </Container>
    </header>
  );
}
