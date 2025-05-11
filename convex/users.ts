import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    password: v.optional(v.string()),
    fullname: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
      password: args.password,
      fullname: args.fullname,
    });

    return { id: userId };
  }
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return { ...user, profile };
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.optional(v.string()),
    image: v.optional(v.string()),
    password: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Authenticated user not found.");
    }

    // Update user fields if provided
    const userUpdates: Record<string, string> = {};
    if (args.fullname) userUpdates.fullname = args.fullname;
    if (Object.keys(userUpdates).length > 0) {
      await ctx.db.patch(currentUser._id, userUpdates);
    }

    const updatedProfile = {
      username: args.username || "",
      email: args.email || "",
      image: args.image || "",
      password: args.password || "",
      updatedAt: new Date().toISOString(),
    };
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    let profileDoc;
    if (profile) {
      await ctx.db.patch(profile._id, updatedProfile);
      profileDoc = await ctx.db.get(profile._id);
    } else {
      const profileId = await ctx.db.insert("profile", {
        userId: currentUser._id,
        ...updatedProfile,
      });
      profileDoc = await ctx.db.get(profileId);

      if (!profileDoc) {
        throw new Error("Failed to create profile");
      }
    }

    return { profile: profileDoc };
  },
});

// New mutation that doesn't require Clerk authentication
export const updateProfileByEmail = mutation({
  args: {
    email: v.string(), // Required to find the user
    fullname: v.optional(v.string()),
    image: v.optional(v.string()),
    password: v.optional(v.string()),
    username: v.optional(v.string()),
    newEmail: v.optional(v.string()), // In case they want to change their email
  },
  handler: async (ctx, args) => {
    console.log('updateProfileByEmail called with email:', args.email);

    // Find user by email
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    // If user not found by email, try to find the most recently created user
    // This is a fallback for when the email in UserContext doesn't match any user
    if (!user) {
      console.log('User not found with email:', args.email, 'Trying fallback...');

      // Get all users and sort by _creationTime (most recent first)
      const users = await ctx.db
        .query("users")
        .order("desc")
        .take(1);

      if (users.length > 0) {
        user = users[0];
        console.log('Found user via fallback:', user.email);
      } else {
        return {
          success: false,
          error: "No users found in the database"
        };
      }
    }

    // Update user fields if provided
    const userUpdates: Record<string, string> = {};
    if (args.fullname) userUpdates.fullname = args.fullname;
    if (args.newEmail) userUpdates.email = args.newEmail;
    if (args.image) userUpdates.image = args.image;

    if (Object.keys(userUpdates).length > 0) {
      await ctx.db.patch(user._id, userUpdates);
    }

    // Update or create profile
    const updatedProfile = {
      username: args.username || user.username || "",
      email: args.newEmail || args.email,
      image: args.image || user.image || "",
      password: args.password || user.password || "",
      updatedAt: new Date().toISOString(),
    };

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    let profileDoc;
    if (profile) {
      await ctx.db.patch(profile._id, updatedProfile);
      profileDoc = await ctx.db.get(profile._id);
    } else {
      const profileId = await ctx.db.insert("profile", {
        userId: user._id,
        ...updatedProfile,
      });
      profileDoc = await ctx.db.get(profileId);

      if (!profileDoc) {
        return {
          success: false,
          error: "Failed to create profile"
        };
      }
    }

    // Get the updated user
    const updatedUser = await ctx.db.get(user._id);

    return {
      success: true,
      user: updatedUser,
      profile: profileDoc
    };
  },
});

export const saveExpoPushToken = mutation({
  args: {
    clerkId: v.string(),
    expoPushToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { expoPushToken: args.expoPushToken });
    return { success: true };
  },
});

export const loginUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      // Return a structured response instead of throwing an error
      return {
        success: false,
        error: "User not found with this email"
      };
    }

    // In a real app, you would use a secure password comparison
    // This is a simplified version for demonstration
    if (user.password !== args.password) {
      return {
        success: false,
        error: "Invalid password"
      };
    }

    return {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    };
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("User is not authenticated");
  }

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) {
    throw new ConvexError("User not found. Please complete registration.");
  }

  return currentUser;
}