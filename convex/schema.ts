import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  careers: defineTable({
    mos: v.string(),
    title: v.string(),
    cat: v.string(),
    desc: v.string(),
    training: v.string(),
    asvab: v.string(),
    bonus: v.boolean(),
  }),
  favorites: defineTable({
    userId: v.string(), // Assuming user auth, but for now, use a placeholder
    mos: v.string(),
    title: v.string(),
  }),
  achievements: defineTable({
    userId: v.string(),
    id: v.string(),
    title: v.string(),
    description: v.string(),
    unlockedAt: v.string(),
  }),
  callbacks: defineTable({
    userId: v.string(),
    name: v.string(),
    phone: v.string(),
    datetime: v.string(),
    created: v.string(),
  }),
  inquiries: defineTable({
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
    created: v.string(),
  }),
});