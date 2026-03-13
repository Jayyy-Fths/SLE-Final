import { query } from "./_generated/server";

export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    // For demo, use a fixed userId
    const userId = "demo-user";
    return await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});