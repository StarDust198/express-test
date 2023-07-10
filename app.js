const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();

app.engine(
  'handlebars', // sets the extention for files
  expressHbs.engine({
    layoutsDir: 'views/layouts/',
    defaultLayout: 'main-layout',
  })
);
app.set('view engine', 'handlebars');
app.set('views', 'views'); // Already set to "views" by default

const adminRouter = require('./routes/admin').router;
const shopRouter = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// Checks for request extensitions and looks for them in public

app.use('/admin', adminRouter);
app.use(shopRouter);

app.use((req, res, next) => {
  res.render('404', { docTitle: 'Page not found' });
});

app.listen(3000);
