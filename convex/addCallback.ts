import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addCallback = mutation({
  args: { name: v.string(), phone: v.string(), datetime: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user";
    await ctx.db.insert("callbacks", {
      userId,
      name: args.name,
      phone: args.phone,
      datetime: args.datetime,
      created: new Date().toISOString(),
    });
  },
});