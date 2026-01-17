import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, existingUserId }) {
      // Only create profile for new users (not updates)
      // New users start as "guest" with "locked" profile until admin promotes them
      if (!existingUserId) {
        try {
          // Check if profile already exists (shouldn't happen but be safe)
          const existingProfile = await ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

          if (existingProfile) {
            console.warn(`Duplicate profile creation attempted for user ${userId}`);
            return;
          }

          await ctx.db.insert("profiles", {
            userId,
            role: "guest",
            profileStatus: "locked",
          });
        } catch (error) {
          // Log the error for debugging - user created but profile failed
          console.error("Failed to create profile for user", userId, error);
          // Re-throw to ensure the user creation transaction fails
          // (prevents orphaned users without profiles)
          throw error;
        }
      }
    },
  },
});
