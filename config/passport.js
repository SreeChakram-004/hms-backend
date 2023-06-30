const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { googleAuth, jwtSecret } = require('./auth');
const { User, RoleUser } = require('../models');

const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

passport.use(
  new GoogleStrategy(
    googleAuth,
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          user = await User.findOne({ where: { email: profile.email } });

          if (!user) {
            const hashedPassword = await bcrypt.hash("password", saltRounds);

            user = await User.create({
              userName: profile.givenName,
              email: profile.email,
              password: hashedPassword,
              googleId: profile.id,
              is_verified: moment().format("YYYY-MM-DD hh:mm:ss"),
              is_active: 0,
              uuid: uuidv4()
            });

            await RoleUser.create({ userId: user.id, roleId: 1 });

            return done(null, user);
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  // Store the user ID in the session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Retrieve the user from the database based on the stored ID
    const user = await User.findByPk(id); // Use the provided ID directly
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
