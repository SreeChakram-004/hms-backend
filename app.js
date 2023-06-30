var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const jwt = require('jsonwebtoken');
const { googleAuth, jwtSecret } = require('./config/auth');
var passport = require('./config/passport');
const session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/userAuth');
var apiRouter = require('./routes/userApi');
var departmentRouter = require('./routes/departmentApi');
var dashboardRouter = require('./routes/api');
require('./config/passport'); // Initialize Passport configuration

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/v1/user', apiRouter);
app.use('/v1/department', departmentRouter);
app.use('/v1/dashboard', dashboardRouter);

// Session middleware
app.use(
  session({
    secret: 'session-secret', // Replace with your preferred session secret
    resave: false,
    saveUninitialized: false
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth login route
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('https://wild-red-clownfish-tam.cyclic.app/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get("/auth/google",
//   // (req, res, next) => {
//   //   req.session.google_oauth2_state = Math.random().toString(36).substring(2);
//   //   next();
//   // },
//   passport.authenticate("google", {
//     scope: ["email", "profile"],
//     prompt: "select_account",
//     state: req.session.google_oauth2_state,
//   })
// );

// Google OAuth callback route
// app.get('/auth/google/callback', passport.authenticate('google',{ session: false }), (req, res) => {
//   // Generate JWT token
//   const accessToken = jwt.sign({ email: req.user.email, password: 'password' }, jwtSecret, { expiresIn: '7d' });
//   const refreshToken = jwt.sign({ email: req.user.email, password: 'password' }, jwtSecret, { expiresIn: '7d' });

//   // Return the tokens as a JSON response
//   res.json({
//     status: true,
//     data: {
//       token_type: 'Bearer',
//       expires_in: '7d',
//       access_token: accessToken,
//       refresh_token: refreshToken
//     }
//   });

// });

app.get('https://wild-red-clownfish-tam.cyclic.app/auth/google/auth/google/callback', passport.authenticate('google',{ session: false }), (req, res) => {
  // Generate JWT token
  const accessToken = jwt.sign({ email: req.user.email, password: 'password' }, jwtSecret, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ email: req.user.email, password: 'password' }, jwtSecret, { expiresIn: '7d' });

  // Return the tokens as a JSON response
  res.json({
    status: true,
    data: {
      token_type: 'Bearer',
      expires_in: '7d',
      access_token: accessToken,
      refresh_token: refreshToken
    }
  });

});


module.exports = app;
