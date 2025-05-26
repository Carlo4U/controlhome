import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";

import { Id } from "./_generated/dataModel";

// Define User interface
interface User {
  _id: Id<"users">;
  username: string;
  email: string;
  image?: string;
  clerkId: string;
  fullname?: string;
  expoPushToken?: string;
  updatedAt?: string;
  password?: string;
  emailOTP?: string;
  otpExpiryTime?: number;
  isEmailVerified?: boolean;
}




// Helper to generate OTP
function generateOTP(): string {
  // Generate a secure 6-digit OTP
  const otp = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  console.log("Generated new OTP:", { otp });
  return otp;
}





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

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx): Promise<User> {
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

  return {
    ...currentUser,
    isEmailVerified: currentUser.isEmailVerified ?? false,
    subscription: currentUser.subscription ?? "inactive",
    hasSeenSubscriptionPrompt: currentUser.hasSeenSubscriptionPrompt ?? false,
  } as User;
}
interface SendEmailOTPResult {
  success: boolean;
  message: string;
  details?: any;
}

// Convert sendEmailOTP to an action since it needs to call another action
export const sendEmailOTP = action({
  args: { clerkId: v.string() },
  handler: async (ctx, args): Promise<SendEmailOTPResult> => {
    try {
      console.log("Starting sendEmailOTP for clerkId:", args.clerkId);

      // Get user information
      const user = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: args.clerkId,
      });

      if (!user) {
        console.log("User not found for clerkId:", args.clerkId);
        return {
          success: false,
          message: "User not found. Please try logging in again.",
          details: { error: "user_not_found", clerkId: args.clerkId },
        };
      }

      console.log("Found user:", {
        email: user.email,
        name: user.fullname,
        userId: user._id,
        isEmailVerified: user.isEmailVerified,
      });

      // Check if email is already verified
      if (user.isEmailVerified) {
        console.log("Email already verified for user:", user.email);
        return {
          success: true,
          message: "Your email is already verified.",
          details: { status: "already_verified" },
        };
      }

      let otp;
      let expiryTime;

      // Check if user already has a valid OTP
      if (
        user.emailOTP &&
        user.otpExpiryTime &&
        user.otpExpiryTime > Date.now()
      ) {
        console.log("User already has a valid OTP, reusing it:", {
          userId: user._id,
          email: user.email,
          otpExists: !!user.emailOTP,
          expiryTimeValid: user.otpExpiryTime > Date.now(),
          timeRemaining:
            Math.floor((user.otpExpiryTime - Date.now()) / 1000) + " seconds",
        });

        // Use existing OTP if it's still valid (not expired)
        otp = user.emailOTP;
        expiryTime = user.otpExpiryTime;
      } else {
        // Generate a new OTP if none exists or the existing one is expired
        otp = generateOTP();
        console.log("Generated new OTP for user:", {
          userId: user._id,
          email: user.email,
          otp,
        });

        expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Update user with new OTP
        try {
          // Update user with new OTP using a mutation
          await ctx.runMutation(api.users.updateUserOTP, {
            clerkId: args.clerkId,
            otp,
            expiryTime,
          });
          console.log("Updated user with OTP and expiry time");
        } catch (updateError: any) {
          console.error("Error updating user OTP:", updateError);
          return {
            success: false,
            message: "Failed to generate verification code. Please try again.",
            details: {
              error: "update_otp_failed",
              message: updateError.message,
            },
          };
        }
      }

      try {
        // Send OTP via email
        console.log("Sending OTP email to user:", {
          email: user.email,
          name: user.fullname,
        });

        // Send OTP email directly
        const BREVO_API_URL = "https://api.sendinblue.com/v3/smtp/email";
        const FROM_EMAIL = "subacarlo431@gmail.com";
        const SUPPORT_EMAIL = "subacarlo431@gmail.com";
        const BREVO_API_KEY = process.env.BREVO_API_KEY;

        if (!BREVO_API_KEY) {
          console.error("Brevo API key is not configured");
          throw new Error("Email service is not properly configured. API key missing.");
        }

        const emailData = {
          sender: {
            name: "Ctrlhome Verification",
            email: FROM_EMAIL,
          },
          to: [
            {
              email: user.email,
              name: user.fullname || user.username,
            },
          ],
          subject: "Ctrlhome Verification Code",
          replyTo: {
            email: SUPPORT_EMAIL,
            name: "@Control Home Support",
          },
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #4a5568; text-align: center;">Verification Code</h1>
              <p>Hello ${user.fullname || user.username},</p>
              <p>Your verification code is:</p>
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              <p>Thank you,<br>The Control Home Team</p>
            </div>
          `,
        };

        const response = await fetch(BREVO_API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "API-Key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        const responseData = await response.json();
        const emailResult = {
          success: response.ok,
          messageId: responseData.messageId,
          error: !response.ok ? responseData.message : undefined,
          details: !response.ok ? responseData : undefined,
        };

        console.log("Email send result:", emailResult);

        if (!emailResult.success) {
          console.error("Failed to send OTP email:", emailResult.error);

          // If email sending fails, clear the OTP to prevent issues
          await ctx.runMutation(api.users.updateUserOTP, {
            clerkId: args.clerkId,
            otp: undefined,
            expiryTime: undefined,
          });

          return {
            success: false,
            message:
              "Failed to send verification code. Please check your email address and try again.",
            details: {
              error: "email_send_failed",
              emailError: emailResult.error,
              emailDetails: emailResult.details,
            },
          };
        }

        return {
          success: true,
          message:
            "Verification code sent successfully. Please check your email inbox (including spam folder).",
          details: { messageId: emailResult.messageId },
        };
      } catch (emailError: any) {
        console.error("Error sending OTP email:", emailError);

        // If email sending fails, clear the OTP to prevent issues
        await ctx.runMutation(api.users.updateUserOTP, {
          clerkId: args.clerkId,
          otp: undefined,
          expiryTime: undefined,
        });

        return {
          success: false,
          message: "Failed to send verification code. Please try again later.",
          details: {
            error: "email_action_failed",
            message: emailError.message,
          },
        };
      }
    } catch (error: any) {
      console.error("Error in sendEmailOTP:", error);
      return {
        success: false,
        message: "Failed to process your request. Please try again.",
        details: { error: "general_error", message: error.message },
      };
    }
  },
});

export const updateUserOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.optional(v.string()),
    expiryTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      emailOTP: args.otp,
      otpExpiryTime: args.expiryTime,
    });

    return { success: true };
  },
});

export const verifyEmailOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Verifying OTP:", { clerkId: args.clerkId, otp: args.otp });
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.isEmailVerified) {
      return { success: true, verified: true };
    }

    if (!user.emailOTP || !user.otpExpiryTime) {
      console.log("No OTP found for user:", { userId: user._id });
      throw new ConvexError("No OTP found. Please request a new one.");
    }

    if (Date.now() > user.otpExpiryTime) {
      console.log("OTP expired:", {
        expiryTime: user.otpExpiryTime,
        currentTime: Date.now(),
        diff: Date.now() - user.otpExpiryTime,
      });
      throw new ConvexError("OTP has expired. Please request a new one.");
    }

    console.log("Comparing OTPs:", {
      providedOTP: args.otp,
      storedOTP: user.emailOTP,
      match: args.otp === user.emailOTP,
    });
    if (args.otp !== user.emailOTP) {
      throw new ConvexError("Invalid OTP. Please try again.");
    }

    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailOTP: undefined,
      otpExpiryTime: undefined,
    });

    return { success: true, verified: true };
  },
});

export const verifyOTP = mutation({
  args: {
    clerkId: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!user.emailOTP || !user.otpExpiryTime) {
      return {
        success: false,
        message: "No OTP found. Please request a new one.",
      };
    }

    if (Date.now() > user.otpExpiryTime) {
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      };
    }

    if (args.otp !== user.emailOTP) {
      return {
        success: false,
        message: "Invalid OTP. Please try again.",
      };
    }

    // OTP is valid, clear it and mark email as verified
    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailOTP: undefined,
      otpExpiryTime: undefined,
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  },
});