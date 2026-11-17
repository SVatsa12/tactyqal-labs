"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Shows a success toast once when `param` is in the URL (set by a server action's
 * redirect, e.g. ?deleted=1), then removes the param so a refresh doesn't repeat it.
 */
export function FlashToast({ param, message }: { param: string; message: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const present = searchParams.has(param);

  React.useEffect(() => {
    if (!present) return;
    toast.success(message, { id: `flash-${param}` }); // id dedupes Strict Mode double effects
    const next = new URLSearchParams(searchParams.toString());
    next.delete(param);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [present, message, param, pathname, router, searchParams]);

  return null;
}
