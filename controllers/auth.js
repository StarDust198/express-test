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
  User.findById('6500d0c5806f132d45e460fe')
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

exports.postSignup = (req, res, next) => {};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log('ERROR LOGGING OUT: ', err);
    res.redirect('/');
  });
};
