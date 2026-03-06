import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UpgradeButton } from '@/components/payment';
import { CITY_MAP } from '@/config/cities';
import type { VerdictCard } from '@/types';

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
  const debateCount = debates?.length ?? 0;
  const freeDebatesUsed = profile?.free_debates_used ?? 0;
  const subscriptionStatus = profile?.subscription_status;
  const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  return (
    <Container className="py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Hey, {displayName}</h1>
          <p className="mt-1 text-zinc-400">
            {isSubscribed
              ? 'VibeCITY Pro — unlimited debates'
              : freeDebatesUsed === 0
                ? 'Your first Council debate is free'
                : 'Upgrade to Pro for unlimited debates'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Debates</p>
            <p className="mt-1 text-2xl font-bold text-white">{debateCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Plan</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {isSubscribed ? 'Pro' : 'Free'}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Free debates used</p>
            <p className="mt-1 text-2xl font-bold text-white">{freeDebatesUsed} / 1</p>
          </div>
        </div>

        {/* Recent debates */}
        {debates && debates.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-200">Recent debates</h2>
            <div className="flex flex-col gap-3">
              {debates.map((debate) => {
                const city = CITY_MAP[debate.city_id];
                const cityName = city?.name ?? debate.city_id;
                const verdict = debate.verdict;

                return (
                  <Link
                    key={debate.id}
                    href={`/city/${debate.city_id}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{cityName}</p>
                      <div className="flex items-center gap-2">
                        {debate.mood && (
                          <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                            {debate.mood}
                          </span>
                        )}
                        <span className="text-xs text-zinc-500">
                          {new Date(debate.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {verdict?.topPick && (
                      <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                        {verdict.topPick}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Upgrade CTA for non-subscribers */}
        {!isSubscribed && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <h2 className="text-lg font-semibold text-white">Unlock unlimited debates</h2>
            <p className="mt-1 mb-4 text-sm text-zinc-400">
              Get unlimited Council debates, saved history, and more.
            </p>
            <UpgradeButton priceId={process.env.STRIPE_PRICE_ID_MONTHLY ?? ''} />
          </div>
        )}

        {/* Empty state */}
        {(!debates || debates.length === 0) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <p className="text-zinc-400">No debates yet. Pick a city and let The Council decide.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
