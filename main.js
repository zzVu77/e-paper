import express from 'express';
import { engine } from 'express-handlebars';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import  categoriesmanagementRouter from './routes/admin/categories.route.js';
import  tagsmanagementRouter from './routes/admin/tags.route.js';
import  personsmanagementRouter from './routes/admin/persons.route.js';
import  articlesmanagementRouter from './routes/admin/articles.route.js';


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

// app.get('/admin/tags', function (req, res) {
//   res.render('admin/tags', { layout: 'admin', title: 'Tags' });
// });


app.use('/admin/categories', categoriesmanagementRouter);
app.use('/admin/tags', tagsmanagementRouter);
app.use('/admin/persons', personsmanagementRouter);
app.use('/admin/articles', articlesmanagementRouter);


app.get('/editor', function (req, res) {
  res.render('editor', { layout: 'admin', title: 'Editor' });
});

app.listen(3000, function () {
  console.log('ecApp is running at http://localhost:3000');
});
