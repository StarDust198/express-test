const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  '/add-product',
  isAuth,
  [
    body('title', 'Title must be at least 6 characters')
      .isLength({ min: 6 })
      .trim(),
    body('imageUrl').isURL().withMessage('Invalid image URL'),
    body('price').isNumeric().withMessage('Price should be numeric'),
    body('description')
      .isLength({ min: 6 })
      .withMessage('Description must be 6 characters long or more')
      .trim(),
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
  '/edit-product',
  isAuth,
  [
    body('title', 'Title must be at least 6 characters')
      .isLength({ min: 6 })
      .trim(),
    body('imageUrl').isURL().withMessage('Invalid image URL'),
    body('price').isNumeric().withMessage('Price should be numeric'),
    body('description')
      .isLength({ min: 6 })
      .withMessage('Description must be 6 characters long or more')
      .trim(),
  ],
  adminController.postEditProduct
);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
