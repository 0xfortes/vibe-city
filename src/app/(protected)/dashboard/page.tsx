import { redirect } from 'next/navigation';
import { Container } from '@/components/ui';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LAUNCH_CITIES, CITY_MAP } from '@/config/cities';
import type { VerdictCard } from '@/types';
import { DashboardClient } from './DashboardClient';

interface ProfileRow {
  display_name: string | null;
  free_debates_used: number;
  subscription_status: string | null;
}

interface DebateRow {
  id: string;
  city_id: string;
  mood: string | null;
  verdict: VerdictCard | null;
  created_at: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, free_debates_used, subscription_status')
    .eq('id', user.id)
    .single<ProfileRow>();

  // Fetch recent debates with verdict
  const { data: debates } = await supabase
    .from('debates')
    .select('id, city_id, mood, verdict, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)
    .returns<DebateRow[]>();

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Explorer';
  const freeDebatesUsed = profile?.free_debates_used ?? 0;
  const subscriptionStatus = profile?.subscription_status;
  const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  // Map debates to include city names for the client component
  const debatesWithCityNames = (debates ?? []).map((debate) => ({
    ...debate,
    cityName: CITY_MAP[debate.city_id]?.name ?? debate.city_id,
    // Narrow verdict to the shape the client component expects
    verdict: debate.verdict ? { topPick: debate.verdict.topPick } : null,
  }));

  // City list for QuickStart
  const cities = LAUNCH_CITIES.map((c) => ({ id: c.id, name: c.name, country: c.country }));

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {displayName}
          </h1>
          <p className="mt-1 text-zinc-400">
            {isSubscribed
              ? 'VibeCITY Pro — unlimited debates'
              : freeDebatesUsed === 0
                ? 'Your first Council debate is free'
                : 'Upgrade to Pro for unlimited debates'}
          </p>
        </div>

        {/* Interactive dashboard content */}
        <DashboardClient
          cities={cities}
          debates={debatesWithCityNames}
          isSubscribed={isSubscribed}
          freeDebatesUsed={freeDebatesUsed}
          priceId={process.env.STRIPE_PRICE_ID_MONTHLY ?? ''}
        />
      </div>
    </Container>
  );
}
