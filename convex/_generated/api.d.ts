/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addCallback from "../addCallback.js";
import type * as addInquiry from "../addInquiry.js";
import type * as awardAchievement from "../awardAchievement.js";
import type * as getAchievements from "../getAchievements.js";
import type * as getCallbacks from "../getCallbacks.js";
import type * as getCareers from "../getCareers.js";
import type * as getFavorites from "../getFavorites.js";
import type * as seedCareers from "../seedCareers.js";
import type * as toggleFavorite from "../toggleFavorite.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addCallback: typeof addCallback;
  addInquiry: typeof addInquiry;
  awardAchievement: typeof awardAchievement;
  getAchievements: typeof getAchievements;
  getCallbacks: typeof getCallbacks;
  getCareers: typeof getCareers;
  getFavorites: typeof getFavorites;
  seedCareers: typeof seedCareers;
  toggleFavorite: typeof toggleFavorite;
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
