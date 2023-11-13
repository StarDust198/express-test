const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/User');

const { mongoPassword: password } = require('./.env');
const MONGODB_URI = `mongodb+srv://roadtomars2030:${password}@cluster0.6j6n0va.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'tsss',
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) return next();

  User.findById(req.session.user._id) // The user from session doesn't have methods!
    .then((user) => {
      if (!user) return next();

      req.user = user;
      next();
    })
    .catch((err) => {
      // will not work here - works only in syncronous code
      // throw new Error(err);
      // that will work
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

// Special type of middleware for catching errors:
app.use((error, req, res, next) => {
  // Might lead to infinite error loop, se we're rendering instead
  // res.redirect('/500');

  res.status(500).render('500', {
    pageTitle: 'Internal server error',
    path: '/500',
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log('NOT CONNECTED! error:', err);
  });
