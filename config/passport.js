const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { googleAuth, jwtSecret } = require('./auth');
const User = require('../models').User;

const moment = require('moment');
const {v4 : uuidv4} = require('uuid');
const userId = uuidv4();
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

passport.use(
  new GoogleStrategy(
    googleAuth,
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        const hashedPassword = await bcrypt.hash('password', salt);
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          // If the user doesn't exist, create a new user in the database
          user = await User.create({ userName:profile.given_name,password:hashedPassword, googleId: profile.id, email: profile.email,uuid:userId,is_verified:moment().format("MM-DD-YYYY hh:mm:ss"),is_active: 0});
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
    let googleUser = await User.findOne({ where: { googleId: profile.id } });
    const user = await User.findByPk(googleUser.id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
