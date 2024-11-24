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
app.get('/article-writer-textEditor', function (req, res) {
  res.render('article-writer-textEditor');
});
app.get('/article-writer-editTextEditor', function (req, res) {
  res.render('article-writer-editTextEditor');
});
app.get('/article-manage-approved', function (req, res) {
  res.render('article-manage-approved');
});
app.get('/article-manage-pending', function (req, res) {
  res.render('article-manage-pending');
});
app.get('/article-manage-published', function (req, res) {
  res.render('article-manage-published');
});
app.get('/article-manage-rejected', function (req, res) {
  res.render('article-manage-rejected');
});
app.get('/article-manage-all', function (req, res) {
  res.render('article-manage-all');
});
app.get('/admin', function (req, res) {
  res.render('admin/dashboard', { layout: 'admin', title: 'Admin Dashboard' });
});

app.listen(3000, function () {
  console.log('ecApp is running at http://localhost:3000');
});
