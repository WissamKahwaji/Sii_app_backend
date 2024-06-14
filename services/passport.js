import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { userModel } from "../models/user/user_model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const sanitizedUserName = profile.displayName.replace(/\s+/g, "");
        const existingUser = await userModel.findOne({
          email: profile.emails[0].value,
        });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = await userModel.create({
          userName: sanitizedUserName,
          fullName: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value,
          password: "", // No password for Google users
        });
        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userModel
    .findById(id)
    .then(user => {
      done(null, user); // Pass the user object to done
    })
    .catch(err => {
      done(err, null); // Pass the error to done
    });
});

export default passport;
