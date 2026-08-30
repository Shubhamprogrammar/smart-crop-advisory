"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Renders an image served from a protected backend route (e.g. disease
 * detection photos — spec §9 "Prevent unauthorized image access") rather
 * than a plain public URL. A bare <img src="/api/..."> can't carry the
 * httpOnly auth cookie cross-origin the way a real fetch can, so this
 * fetches the bytes via apiClient (withCredentials: true) and renders
 * them as a local object URL instead.
 *
 * If reusing one instance for a series of different `src` values (e.g. a
 * gallery), pass `key={src}` from the caller so each image gets a fresh
 * mount instead of showing a stale blob while the next one loads.
 */
export function AuthenticatedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;
    let cancelled = false;

    apiClient
      .get(src, { responseType: "blob" })
      .then(({ data }) => {
        if (cancelled) return;
        currentUrl = URL.createObjectURL(data);
        setObjectUrl(currentUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [src]);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-muted text-sm text-foreground/50 ${className}`}>
        Image unavailable
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Spinner className="text-primary" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- source is a runtime-fetched blob: URL, not a static asset next/image can optimize.
  return <img src={objectUrl} alt={alt} className={className} />;
}
