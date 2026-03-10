'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DebateItem {
  id: string;
  city_id: string;
  cityName: string;
  mood: string | null;
  verdict: { route: string } | null;
  created_at: string;
}

interface DebateHistoryProps {
  debates: DebateItem[];
  onDelete: (ids: string[]) => void;
}

export function DebateHistory({ debates, onDelete }: DebateHistoryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  function toggleSelection(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onDelete(Array.from(selected));
    setSelected(new Set());
    setConfirming(false);
  }

  function cancelDelete() {
    setConfirming(false);
  }

  if (debates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.06] p-8 text-center">
        <p className="text-white/40">No debates yet. Pick a city and let The Council decide.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[--card-bg] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono-label text-xs font-bold text-white/35">Recent debates</h2>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {confirming && (
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/80"
            >
              {confirming ? `Confirm delete (${selected.size})` : `Delete selected (${selected.size})`}
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {debates.map((debate) => (
          <div key={debate.id} className="flex items-start gap-3">
            <label className="flex items-center pt-4">
              <input
                type="checkbox"
                checked={selected.has(debate.id)}
                onChange={() => toggleSelection(debate.id)}
                className="h-4 w-4 cursor-pointer rounded border-white/[0.1] bg-white/[0.04] accent-[#00FFaa]"
              />
            </label>
            <Link
              href={`/debate/${debate.id}`}
              className="group flex-1 rounded-[18px] border border-white/[0.06] bg-[--card-bg] p-4 transition-all duration-400 hover:border-transparent hover:bg-gradient-to-br hover:from-[#00FFaa]/10 hover:via-transparent hover:to-[#06b6d4]/10"
            >
              <div className="rounded-[17px] transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{debate.cityName}</p>
                  <div className="flex items-center gap-2">
                    {debate.mood && (
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/40">
                        {debate.mood}
                      </span>
                    )}
                    <span className="font-mono text-xs text-white/25">
                      {new Date(debate.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {debate.verdict?.route && (
                  <p className="mt-2 text-sm italic text-white/40 line-clamp-2">
                    {debate.verdict.route}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
