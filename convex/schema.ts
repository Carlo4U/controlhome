import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    password: v.optional(v.string()),
    fullname: v.optional(v.string()),
    expoPushToken: v.optional(v.string())
  })
    .index("by_clerkId", ["clerkId"]),

  profile: defineTable({
    userId: v.id("users"),
    image: v.optional(v.string()),
    username: v.string(),
    email: v.string(),
    password: v.string(),
    updatedAt: v.optional(v.string())
  }).index("by_userId", ["userId"]),
});