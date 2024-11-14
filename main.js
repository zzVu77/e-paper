import express from 'express';
import { engine } from 'express-handlebars';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
// const path = require("path");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '/views/layouts/'),
    partialsDir: join(__dirname, '/views/components/'),
  })
);

app.set('view engine', 'hbs');
app.set('views', './views/pages');
app.use(express.static('public'));

app.get('/posts', function (req, res) {
  res.render('posts');
});
app.get('/article', function (req, res) {
  res.render('article-detail');
});

app.get('/features', function (req, res) {
  res.render('features');
});
app.get('/about', function (req, res) {
  res.render('about');
});
app.get('/account-setting-myprofile', function (req, res) {
  res.render('account-setting-myprofile');
});
app.get('/account-setting-security', function (req, res) {
  res.render('account-setting-security');
});
app.get('/account-setting-upgrade', function (req, res) {
  res.render('account-setting-upgrade');
});
app.get('/admin', function (req, res) {
  res.render('admin/dashboard', { layout: 'admin', title: 'Admin Dashboard' });
});

app.listen(3000, function () {
  console.log('ecApp is running at http://localhost:3000');
});
