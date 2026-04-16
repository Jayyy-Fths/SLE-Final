import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const addInquiry = mutation({
  args: { firstName: v.string(), lastName: v.string(), email: v.string(), phone: v.string(), message: v.string() },
  handler: async (ctx, args) => {
    const userId = "demo-user";
    await ctx.db.insert("inquiries", {
      userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      message: args.message,
      created: new Date().toISOString(),
    });

    // TODO: Set up email notifications to send inquiry details to the site owner
    // Use Convex email integration: https://docs.convex.dev/production/integrations/email
    // Example: await sendEmail({ to: "owner@example.com", subject: "New Inquiry", text: ... });
    console.log("New inquiry received:", args); // For development, check Convex dashboard for inquiries
  },
});