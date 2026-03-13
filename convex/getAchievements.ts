import { query } from "./_generated/server";

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = "demo-user";
    return await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});