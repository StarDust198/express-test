exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthentificated: false,
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
  res.redirect('/');
};
