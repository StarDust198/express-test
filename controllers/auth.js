const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const { emailUser, emailPassword } = require('../.env');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

const options = {};

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error')[0];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage,
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash('error')[0];

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email.');
        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (!doMatch) {
            req.flash('error', 'Invalid password.');
            return res.redirect('./login');
          }

          req.session.isLoggedIn = true;
          req.session.user = user;

          return req.session.save((err) => {
            if (err) {
              console.log('ERROR LOGGING IN DURING SAVING SESSION: ', err);
            }
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
      if (userDoc) {
        req.flash('error', 'Email already registered.');
        return res.redirect('/signup');
      }

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
          transporter.sendMail(
            {
              from: emailUser,
              to: email,
              subject: 'Successful Signup',
              html: '<h1>You have successfully signed up!</h1>',
            },
            (err, info) => {
              if (err) {
                console.log(err);
                return;
              }

              console.log('succesfully sent, response:', info.response);
            }
          );

          return res.redirect('/login');
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
