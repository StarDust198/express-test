const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject('No user with that email address');
          }
        });
      }),
    body(
      'password',
      'Password must with only letters and numbers and at least 6 characters'
    )
      .isLength({ min: 6 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Invalid email')
      .custom((value, { req }) => {
        // Example of custom validation
        // if (value === 'test@test.com')
        //   throw new Error('This email address is forbidden');
        // return true;

        // If promise returned validator will wait for it to be fulfilled/rejected
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('Email already registered.');
          }
        });
      }),
    // just an alternative to checking the whole req
    body(
      'password',
      'Password must with only letters and numbers and at least 6 characters'
    )
      .isLength({ min: 6 })
      .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error('Passwords do not match!');
      return true;
    }),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
