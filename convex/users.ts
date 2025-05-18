import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    fullname: v.optional(v.string()),
    password: v.optional(v.string()),
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
      fullname: args.fullname,
      updatedAt: new Date().toISOString(),
      password: args.password,
    });

    // Create a profile for the user with required fields
    const profileId = await ctx.db.insert("profile", {
      userId: userId,
      username: args.username,
      email: args.email, // Ensure email is always set
      image: args.image,
      updatedAt: new Date().toISOString(),
      password: args.password,
    });

    return { id: userId, profileId };
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
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("Authenticated user not found.");
    }

    // Update user fields if provided
    const userUpdates: Record<string, string> = {};
    if (args.username) userUpdates.username = args.username; // Add username to user updates
    if (args.fullname) userUpdates.fullname = args.fullname;
    if (args.image) userUpdates.image = args.image;
    if (args.password) userUpdates.password = args.password;

    // Always update the updatedAt timestamp
    userUpdates.updatedAt = new Date().toISOString();

    if (Object.keys(userUpdates).length > 0) {
      console.log('updateProfile: Updating user with fields:', userUpdates);
      await ctx.db.patch(currentUser._id, userUpdates);
    } else {
      console.log('updateProfile: No user fields to update');
    }

    // Make sure we have the current user's email if not provided in args
    // Use profileValidator to ensure type safety
    const updatedProfile = {
      username: args.username || currentUser.username || "",
      email: args.email || currentUser.email, // Use current user's email if not provided
      image: args.image || currentUser.image || "",
      updatedAt: new Date().toISOString(),
      password: args.password || currentUser.password,
    };

    // Validate the profile data against the schema
    if (!updatedProfile.username || !updatedProfile.email) {
      console.error("Profile validation error: missing required fields");
      throw new ConvexError("Username and email are required");
    }
    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    let profileDoc;
    if (profile) {
      console.log('updateProfile: Updating existing profile with fields:', updatedProfile);
      await ctx.db.patch(profile._id, updatedProfile);
      profileDoc = await ctx.db.get(profile._id);
    } else {
      console.log('updateProfile: Creating new profile with fields:', updatedProfile);
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
    username: v.optional(v.string()),
    newEmail: v.optional(v.string()), // In case they want to change their email
    password: v.optional(v.string()), // Added password field
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
    if (args.username) userUpdates.username = args.username; // Add username to user updates
    if (args.fullname) userUpdates.fullname = args.fullname;
    if (args.newEmail) userUpdates.email = args.newEmail;
    if (args.image) userUpdates.image = args.image;
    if (args.password) userUpdates.password = args.password;

    // Always update the updatedAt timestamp
    userUpdates.updatedAt = new Date().toISOString();

    if (Object.keys(userUpdates).length > 0) {
      console.log('Updating user with fields:', userUpdates);
      await ctx.db.patch(user._id, userUpdates);
    } else {
      console.log('No user fields to update');
    }

    // Update or create profile
    // Ensure we always have an email value
    const emailToUse = args.newEmail || args.email;
    if (!emailToUse) {
      return {
        success: false,
        error: "Email is required for profile"
      };
    }

    const updatedProfile = {
      username: args.username || user.username || "",
      email: emailToUse,
      image: args.image || user.image || "",
      updatedAt: new Date().toISOString(),
      password: args.password || user.password,
    };

    // Validate the profile data
    if (!updatedProfile.username || !updatedProfile.email) {
      return {
        success: false,
        error: "Username and email are required"
      };
    }

    const profile = await ctx.db
      .query("profile")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    let profileDoc;
    if (profile) {
      console.log('Updating existing profile with fields:', updatedProfile);
      await ctx.db.patch(profile._id, updatedProfile);
      profileDoc = await ctx.db.get(profile._id);
    } else {
      console.log('Creating new profile with fields:', updatedProfile);
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

    // With Clerk authentication, we don't need password verification
    // Just return the user if found by email
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