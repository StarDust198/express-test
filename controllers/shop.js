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
      console.log('ERROR FETCHING PRODUCTS: ', err);
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
      console.log('ERROR GETTING PRODUCT: ', err);
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
      console.log('ERROR SHOWING LIST OF PRODUCTS: ', err);
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
    .catch(console.log);
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
      console.log('ERROR DELETING PRODUCT FROM CART: ', err);
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
      console.log('ERROR GETTING ORDERS: ', err);
    });
};

// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout',
//   });
// };
