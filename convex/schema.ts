import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(), // Google account email used to sign in
    image: v.optional(v.string()),
    clerkId: v.string(),
    fullname: v.optional(v.string()),
    expoPushToken: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    password: v.optional(v.string()) // Added password field
  })
    .index("by_clerkId", ["clerkId"]),

  profile: defineTable({
    userId: v.id("users"),
    image: v.optional(v.string()),
    username: v.string(),
    email: v.string(), // Required field
    updatedAt: v.optional(v.string()),
    password: v.optional(v.string()) // Added password field
  }).index("by_userId", ["userId"]),
});