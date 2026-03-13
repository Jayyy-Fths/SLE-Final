import { query } from "./_generated/server";

export const getCallbacks = query({
  args: {},
  handler: async (ctx) => {
    const userId = "demo-user";
    return await ctx.db
      .query("callbacks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});