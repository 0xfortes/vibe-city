'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DebateItem {
  id: string;
  city_id: string;
  cityName: string;
  mood: string | null;
  verdict: { topPick: string } | null;
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
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <p className="text-zinc-400">No debates yet. Pick a city and let The Council decide.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">Recent debates</h2>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {confirming && (
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
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
                className="h-4 w-4 cursor-pointer rounded border-zinc-700 bg-zinc-800 accent-zinc-400"
              />
            </label>
            <Link
              href={`/debate/${debate.id}`}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{debate.cityName}</p>
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
              {debate.verdict?.topPick && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                  {debate.verdict.topPick}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
