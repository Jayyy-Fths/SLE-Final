import { query } from "./_generated/server";

export const getCareers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("careers").collect();
  },
});