import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggleFavorite = mutation({
  args: { mos: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user";
    const existing = await ctx.db
      .query("favorites")
      .filter((q) => q.and(q.eq(q.field("userId"), userId), q.eq(q.field("mos"), args.mos)))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      // Check if less than 5
      const count = await ctx.db
        .query("favorites")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();
      if (count.length < 5) {
        await ctx.db.insert("favorites", { userId, mos: args.mos, title: args.title });
      } else {
        // Remove oldest and add new
        const oldest = count[0];
        await ctx.db.delete(oldest._id);
        await ctx.db.insert("favorites", { userId, mos: args.mos, title: args.title });
      }
    }
  },
});