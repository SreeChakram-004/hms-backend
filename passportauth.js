const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('./models').User; // Replace with the path to your User model

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret-key', // Replace with your preferred secret key
};

const jwtVerify = async (payload, done) => {
  try {
    const user = await User.findOne({ where: { id: payload.userId } });

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

passport.use(new JwtStrategy(jwtOptions, jwtVerify));

module.exports = passport;
