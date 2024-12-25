import passport from "passport";
import LocalStrategy from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import knex from "../../utils/db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

import fetch from "node-fetch";

const googleClientId = Buffer.from(
  process.env.GOOGLE_CLIENT_ID,
  "base64"
).toString("utf-8");
const googleClientSecret = Buffer.from(
  process.env.GOOGLE_CLIENT_SECRET,
  "base64"
).toString("utf-8");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: "/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.birthday.read",
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Make the second API call to fetch the birthday
        const response = await fetch(
          `https://people.googleapis.com/v1/people/me?personFields=birthdays`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();

        const birthday = data.birthdays ? data.birthdays[0].date : null;

        const [user] = await knex("users").where({
          email: profile.emails[0].value,
        });
        if (user) return done(null, user);

        const newUser = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          oauth_id: profile.id,
          oauth_token: accessToken,
          birthdate: birthday, // Store birthday if available
          password: null,
          role: "guest",
        };
        await knex("users").insert(newUser);
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

const githubClientId = Buffer.from(
  process.env.GITHUB_CLIENT_ID,
  "base64"
).toString("utf-8");
const githubClientSecret = Buffer.from(
  process.env.GITHUB_CLIENT_SECRET,
  "base64"
).toString("utf-8");

passport.use(
  new GitHubStrategy(
    {
      clientID: githubClientId,
      clientSecret: githubClientSecret,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [user] = await knex("users").where({
          email: profile.emails[0].value,
        });
        if (user) return done(null, user);

        const newUser = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "github",
          oauth_id: profile.id,
          oauth_token: accessToken,
          birthdate: null, // GitHub does not provide birthdate
          password: null,
          role: "guest",
        };
        await knex("users").insert(newUser);
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        // Fetch the user from the database
        const [user] = await knex("users").where({ email });

        // If the user does not exist, return an error
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Check if the account is linked to a provider other than 'local'
        if (user.provider && user.provider !== "local") {
          return done(null, false, {
            message: `This email is registered using ${user.provider}. Please log in using ${user.provider}.`,
          });
        }

        // Check if password or user.password is missing
        if (!password || !user.password) {
          return done(null, false, {
            message: "Password validation failed. Please try again.",
          });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        // If the passwords do not match, return an error
        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // If everything is fine, return the user
        return done(null, user);
      } catch (err) {
        console.error("Error during authentication:", err); // Log the error for debugging
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    role: user.role,
  };
  console.log("sessionData", sessionData);
  done(null, sessionData);
});

passport.deserializeUser(async (sessionData, done) => {
  try {
    const [user] = await knex("users").where({ id: sessionData.id });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
