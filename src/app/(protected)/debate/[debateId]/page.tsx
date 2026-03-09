import { redirect, notFound } from 'next/navigation';
import { Container } from '@/components/ui';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CITY_MAP } from '@/config/cities';
import { DebateReplay } from '@/components/council/DebateReplay';
import type { AgentMessage, VerdictCard } from '@/types';

interface DebatePageRow {
  id: string;
  city_id: string;
  mood: string | null;
  messages: AgentMessage[];
  verdict: VerdictCard | null;
  created_at: string;
}

interface DebatePageProps {
  params: Promise<{ debateId: string }>;
}

export default async function DebatePage({ params }: DebatePageProps) {
  const { debateId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: debate } = await supabase
    .from('debates')
    .select('id, city_id, mood, messages, verdict, created_at')
    .eq('id', debateId)
    .eq('user_id', user.id)
    .single<DebatePageRow>();

  if (!debate) {
    notFound();
  }

  const city = CITY_MAP[debate.city_id];
  const cityName = city?.name ?? debate.city_id;

  return (
    <Container className="py-8">
      <DebateReplay
        cityName={cityName}
        mood={debate.mood}
        messages={debate.messages}
        verdict={debate.verdict}
        createdAt={debate.created_at}
      />
    </Container>
  );
}
