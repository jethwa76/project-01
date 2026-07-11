import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";
import { env } from "./env.js";

export function initializePassport() {
  // Serialize user ID into session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth 2.0
  if (env.googleClientId && env.googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.googleClientId,
          clientSecret: env.googleClientSecret,
          callbackURL: env.googleCallbackUrl,
          scope: ["profile", "email"]
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("No email returned from Google."), null);

            // Check if user exists with this email
            let user = await User.findOne({ email });

            if (user) {
              // Link Google provider if not already linked
              if (user.provider === "local") {
                user.provider = "google";
                user.providerId = profile.id;
                user.emailVerified = true;
                if (!user.avatar?.url && profile.photos?.[0]?.value) {
                  user.avatar = { url: profile.photos[0].value, publicId: "" };
                }
                await user.save({ validateBeforeSave: false });
              }
            } else {
              // Create new user from Google profile
              user = await User.create({
                name: profile.displayName || email.split("@")[0],
                email,
                password: `OAuth_${Date.now()}_${Math.random().toString(36)}`,
                provider: "google",
                providerId: profile.id,
                emailVerified: true,
                avatar: profile.photos?.[0]?.value
                  ? { url: profile.photos[0].value, publicId: "" }
                  : undefined
              });
            }

            done(null, user);
          } catch (err) {
            done(err, null);
          }
        }
      )
    );
    console.log("✅ Google OAuth strategy configured");
  } else {
    console.log("⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET)");
  }

  // GitHub OAuth
  if (env.githubClientId && env.githubClientSecret) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: env.githubClientId,
          clientSecret: env.githubClientSecret,
          callbackURL: env.githubCallbackUrl,
          scope: ["user:email"]
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

            let user = await User.findOne({
              $or: [
                { email },
                { provider: "github", providerId: profile.id }
              ]
            });

            if (user) {
              if (user.provider === "local") {
                user.provider = "github";
                user.providerId = profile.id;
                user.emailVerified = true;
                if (!user.avatar?.url && profile.photos?.[0]?.value) {
                  user.avatar = { url: profile.photos[0].value, publicId: "" };
                }
                await user.save({ validateBeforeSave: false });
              }
            } else {
              user = await User.create({
                name: profile.displayName || profile.username || "GitHub User",
                email,
                password: `OAuth_${Date.now()}_${Math.random().toString(36)}`,
                provider: "github",
                providerId: profile.id,
                emailVerified: true,
                avatar: profile.photos?.[0]?.value
                  ? { url: profile.photos[0].value, publicId: "" }
                  : undefined
              });
            }

            done(null, user);
          } catch (err) {
            done(err, null);
          }
        }
      )
    );
    console.log("✅ GitHub OAuth strategy configured");
  } else {
    console.log("⚠️  GitHub OAuth not configured (missing GITHUB_CLIENT_ID/SECRET)");
  }

  return passport;
}
