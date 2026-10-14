"use client";

import { useMemo, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useToday(): Date | null {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return useMemo(() => (mounted ? new Date() : null), [mounted]);
}
