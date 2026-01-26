/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as batchItems from "../batchItems.js";
import type * as batches from "../batches.js";
import type * as blockchain from "../blockchain.js";
import type * as cron from "../cron.js";
import type * as diplomas from "../diplomas.js";
import type * as universities from "../universities.js";
import type * as verifiers from "../verifiers.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  batchItems: typeof batchItems;
  batches: typeof batches;
  blockchain: typeof blockchain;
  cron: typeof cron;
  diplomas: typeof diplomas;
  universities: typeof universities;
  verifiers: typeof verifiers;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
