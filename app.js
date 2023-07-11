const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs'); // Looks for 'ejs' extensions
app.set('views', 'views'); // Already set to "views" by default

const adminRouter = require('./routes/admin').router;
const shopRouter = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// Checks for request with extensitions and looks for this files in public

app.use('/admin', adminRouter);
app.use(shopRouter);

app.use((req, res, next) => {
  res.render('404', { docTitle: 'Page not found', path: '' });
});

app.listen(3000);
