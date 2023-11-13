const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Order = require('../models/Order');
const Product = require('../models/Product');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      console.log('FETCHED PRODUCTS: ', products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  console.log('productId: ', productId);
  Product.findById(productId)
    .then((product) => {
      res.render('shop/product-detail', {
        product,
        pageTitle: `${product.title} details`,
        path: `/products/${product._id}`,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => req.user.addToCart(product))
    .then((result) => {
      res.redirect('/cart');
    });
};

exports.postCartDelete = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFromCart(productId)
    .then((result) => {
      console.log('DELETED FROM CART');
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const order = new Order({
        user: {
          email: user.email,
          userId: user,
        },
        items: user.cart.items,
      });

      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch((err) => {
      console.log('ERROR ADDING ORDER: ', err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error('No order found'));
      if (order.user.userId.toString() !== req.user._id.toString())
        return next(new Error('Unauthorized'));

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      // Generate PDF for response
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice: #' + orderId, {
        underline: true,
      });
      pdfDoc.fontSize(14).text('-------------------------------------------');
      let totalPrice = 0;
      order.items.forEach((prod) => {
        totalPrice += prod.quantity * prod.productId.price;
        pdfDoc.text(
          `${prod.productId.title} - ${prod.quantity} x $${prod.productId.price}`
        );
      });
      pdfDoc.text('-------------------------------------------');
      pdfDoc.fontSize(20).text(`Total price: $${totalPrice}`);

      pdfDoc.end();

      // Option - read file and send it from the memory
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) return next(err);

      //   // Otherwise we are being offered to download file without an extension
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      //   res.send(data);
      // });

      // Streaming - better, esp. for bigger files
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`);
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
