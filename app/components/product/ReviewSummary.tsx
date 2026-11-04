import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { API_BASE } from '~/config/api';

// "What customers say": AI summary of the product's reviews (needs at least 2 reviews).
export default function ReviewSummary({ productId }: { productId: number | string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSummary(null);
    fetch(`${API_BASE}/ai/review-summary/${productId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setSummary(data?.summary ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!loading && !summary) return null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-[#255FA6]">
        <Sparkles size={16} className="text-[#FFB020]" /> What customers say
      </p>
      {loading ? (
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-blue-100" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-blue-100" />
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-dark)]">{summary}</p>
      )}
      <p className="mt-2 text-[11px] text-[var(--color-muted)]">Summarised by Dalab AI from customer reviews.</p>
    </div>
  );
}
