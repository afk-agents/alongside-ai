import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, existingUserId }) {
      // Only create profile for new users (not updates)
      if (!existingUserId) {
        // Check if profile already exists (shouldn't happen but be safe)
        const existingProfile = await ctx.db
          .query("profiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .unique();

        if (!existingProfile) {
          await ctx.db.insert("profiles", {
            userId,
            role: "guest",
            profileStatus: "locked",
          });
        }
      }
    },
  },
});
