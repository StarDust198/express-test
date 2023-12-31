const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error')[0];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash('error')[0];

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage,
    oldInput: { email: '', password: '', confirmPassword: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email })
    .then((user) => {
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  bcrypt
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
          from: process.env.EMAIL_USER,
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
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log('ERROR LOGGING OUT: ', err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  const errorMessage = req.flash('error')[0];

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('ERROR RESETTING PASSWORD: ', err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
      })
      .then((result) => {
        res.redirect('/login');
        transporter.sendMail(
          {
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Password Reset Requested',
            html: `
              <p>You requested a password reset!</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
            `,
          },
          (err, info) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log('succesfully sent, response:', info.response);
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
  })
    .then((user) => {
      const errorMessage = req.flash('error')[0];

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log('ERROR LOADING USER FOR PASSWORD CHANGE: ', err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {
      $gt: Date.now(),
    },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      resetUser.save();
    })
    .then((result) => {
      res.redirect('/login');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
