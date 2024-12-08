import passport from "passport";
import LocalStrategy from 'passport-local';
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import knex from "../../utils/db.js";
import dotenv from "dotenv";
dotenv.config();

import fetch from 'node-fetch';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
            scope: ["profile", "email", "https://www.googleapis.com/auth/user.birthday.read"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Make the second API call to fetch the birthday
                const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=birthdays`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();

                const birthday = data.birthdays ? data.birthdays[0].date : null;

                const [user] = await knex("users").where({ email: profile.emails[0].value });
                if (user) return done(null, user);

                const newUser = {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'google',
                    oauth_id: profile.id,
                    oauth_token: accessToken,
                    birthdate: birthday, // Store birthday if available
                    password: null,
                    role: "subscriber",
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
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/auth/github/callback",
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const [user] = await knex("users").where({ email: profile.emails[0].value });
                if (user) return done(null, user);

                const newUser = {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'github',
                    oauth_id: profile.id,
                    oauth_token: accessToken,
                    birthdate: null, // GitHub does not provide birthdate
                    password: null,
                    role: "subscriber",
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
        { usernameField: 'email', passwordField: 'password' }, // Customize if necessary
        async (email, password, done) => {
            try {
                const [user] = await knex('users').where({ email });
                if (!user) return done(null, false, { message: 'Invalid email or password' });

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return done(null, false, { message: 'Invalid email or password' });

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const [user] = await knex("users").where({ id });
    done(null, user);
});

export default passport;
