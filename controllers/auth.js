const bcrypt = require('bcryptjs');

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
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) return res.redirect('/login');

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) return res.redirect('./login');

          req.session.isLoggedIn = true;
          req.session.user = user;

          return req.session.save((err) => {
            if (err)
              console.log('ERROR LOGGING IN DURING SAVING SESSION: ', err);
            res.redirect('/');
          });
        })
        .catch((err) => {
          console.log('ERROR COMPARING PASSWORD: ', err);
          res.redirect('/login');
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
      if (userDoc) return res.redirect('/signup');

      return bcrypt
        .hash(password, 12) // hashing password, 12 is highly secure level
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log('ERROR LOGGING OUT: ', err);
    res.redirect('/');
  });
};
