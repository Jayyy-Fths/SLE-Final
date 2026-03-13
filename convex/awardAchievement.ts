import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const awardAchievement = mutation({
  args: { id: v.string(), title: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user";
    const existing = await ctx.db
      .query("achievements")
      .filter((q) => q.and(q.eq(q.field("userId"), userId), q.eq(q.field("id"), args.id)))
      .first();
    if (!existing) {
      await ctx.db.insert("achievements", {
        userId,
        id: args.id,
        title: args.title,
        description: args.description,
        unlockedAt: new Date().toISOString(),
      });
    }
  },
});