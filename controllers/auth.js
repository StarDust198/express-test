const User = require('../models/User');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    // Added for all pages within req.session.isLoggedIn
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('6509e827e11ce26ddcb8bf2d')
    .then((user) => {
      // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly') // setting cookie for browser manually
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        if (err) console.log('ERROR LOGGING IN DURING SAVING SESSION: ', err);
        res.redirect('/');
      });
    })
    .catch((err) => {
      console.log('ERROR LOGGING IN: ', err);
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup');
      }
      const user = new User({ email, password, cart: { items: [] } });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log('ERROR LOGGING OUT: ', err);
    res.redirect('/');
  });
};
