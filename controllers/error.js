exports.getNotFound = (req, res, next) => {
  res.render('404', { docTitle: 'Page not found', path: '' });
};
