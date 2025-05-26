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
    password: v.optional(v.string()), // Added password field
    emailOTP: v.optional(v.string()), // OTP for email verification
    otpExpiryTime: v.optional(v.number()), // Expiry time for OTP
    isEmailVerified: v.optional(v.boolean()), // Whether email is verified
    subscription: v.optional(v.string()), // User subscription status
    hasSeenSubscriptionPrompt: v.optional(v.boolean()) // Whether user has seen subscription prompt
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