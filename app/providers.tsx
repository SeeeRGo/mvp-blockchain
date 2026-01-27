"use client";

import { ConvexProvider, convex } from "../convex/client";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex()}>{children}</ConvexProvider>;
}
