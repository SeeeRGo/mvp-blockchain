import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { api } from "./_generated/api";

// Lazy initialization to avoid issues during Convex function analysis
let convex: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (!convex) {
    convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
      unsavedChangesWarning: false,
    });
  }
  return convex;
}

export { ConvexProvider, getConvexClient as convex };
