"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

export default function InfiniteScrollLoader({
  hasNextPage,
  loading,
  onLoadMore,
}: {
  hasNextPage: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    // Keep the observer callback current without recreating the observer on every render.
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current) onLoadMore();
      },
      // Start loading before the sentinel is visible so scrolling does not pause at page edges.
      { rootMargin: "240px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, onLoadMore]);

  if (!hasNextPage && !loading) return null;

  return (
    <div ref={sentinelRef} className="flex min-h-20 items-center justify-center py-6">
      {loading && (
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading more...
        </div>
      )}
    </div>
  );
}