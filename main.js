import express from "express";
import { engine } from "express-handlebars";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import formatDateTime from "./helpers/formatDateTime.js";
import genPDF from "./public/js/genPDF.js";
import accountmanagementRouter from "./routes/account.route.js";
import articlesmanagementRouter from "./routes/admin/articles.route.js";
import categoriesmanagementRouter from "./routes/admin/categories.route.js";
import personsmanagementRouter from "./routes/admin/persons.route.js";
import tagsmanagementRouter from "./routes/admin/tags.route.js";
import editormanagementRouter from "./routes/editor.route.js";
import postsRouter from "./routes/posts.route.js";
import articleService from "./services/article.service.js";
import categoryService from "./services/category.service.js";
import session from "express-session";
import passport from "./auth/config/passportConfig.js";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import { ensureAuthenticated } from "./auth/middlewares/authMiddleware.js";
import Handlebars from 'handlebars';
import dotenv from "dotenv";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
// const path = require("path");

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  express.urlencoded({
    extended: true,
  })
);

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: join(__dirname, "/views/layouts/"),
    partialsDir: join(__dirname, "/views/components/"),
    helpers: {
      format_datetime: formatDateTime,
      compareStrings(str1, str2) {
        return str1 === str2; // Trả về true nếu hai chuỗi bằng nhau, ngược lại trả về false
      },
    },
  })
);
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", "./views/pages");
app.use(express.static("public"));
// setup local data for navigation
app.use(async function (req, res, next) {
  const currentCategory = req.query.name || "";
  const categories = await categoryService.getCategoryName();
  const listCategory = [];
  const parentCat = currentCategory
    ? await categoryService.getParentCategory(currentCategory)
    : "";
  for (let index = 0; index < categories.length; index++) {
    listCategory.push({
      currentCategory: currentCategory,
      parent_name: categories[index].parent_name,
      child_categories: categories[index].child_categories,
      parent_cat_active:
        parentCat === categories[index].parent_name ||
        currentCategory === categories[index].parent_name,
    });
  }
  // console.log(listCategory);
  res.locals.categories = listCategory;
  res.locals.user = req.user;
  console.log("Session data:", req.session);
  console.log("User data:", req.user);
  next();
});

app.get("/features", function (req, res) {
  res.render("features");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/admin", function (req, res) {
  res.render("admin/dashboard", { layout: "admin", title: "Admin Dashboard" });
});

app.get("/account-setting-myprofile", ensureAuthenticated, function (req, res) {
  res.render("account-setting-myprofile");
});
app.get("/account-setting-security", function (req, res) {
  res.render("account-setting-security", {user: req.user});
});
app.get("/account-setting-upgrade", function (req, res) {
  res.render("account-setting-upgrade");
});

app.get("/forgot-password", function (req, res) {
  res.render("forgotPassword", { layout: "default" });
});
app.get("/verify-otp", function (req, res) {
  res.render("verify-otp", { layout: "default" });
});
app.get("/article-writer-textEditor", function (req, res) {
  res.render("article-writer-textEditor");
});
app.get("/article-writer-editTextEditor", function (req, res) {
  res.render("article-writer-editTextEditor");
});
app.get("/article-manage-approved", function (req, res) {
  res.render("article-manage-approved");
});
app.get("/article-manage-pending", function (req, res) {
  res.render("article-manage-pending");
});
app.get("/article-manage-published", function (req, res) {
  res.render("article-manage-published");
});
app.get("/article-manage-rejected", function (req, res) {
  res.render("article-manage-rejected");
});
app.get("/article-manage-all", function (req, res) {
  res.render("article-manage-all");
});
// app.get('/admin/tags', function (req, res) {
//   res.render('admin/tags', { layout: 'admin', title: 'Tags' });
// });
app.use("/admin/categories", categoriesmanagementRouter);
app.use("/admin/tags", tagsmanagementRouter);
app.use("/admin/persons", personsmanagementRouter);
app.use("/admin/articles", articlesmanagementRouter);
app.use("/posts", postsRouter);

// app.get("/editor", function (req, res) {
//   res.render("editor", { layout: "admin", title: "Editor" });
// });

app.get("/", async (req, res) => {
  res.render("home", {
    popularPosts: await articleService.getTopTrendingArticles(),
    mostViewed: await articleService.getMostViewedArticles(),
    latestPosts: await articleService.getLatestArticles(),
    topCategories: await articleService.getLatestArticleOfTopCategories(),
  });
});

app.use("/admin/categories", categoriesmanagementRouter);
app.use("/admin/tags", tagsmanagementRouter);
app.use("/admin/persons", personsmanagementRouter);
app.use("/admin/articles", articlesmanagementRouter);
app.use("/editor", editormanagementRouter);
app.use("/account", accountmanagementRouter);
app.use("/auth", authRoutes);
app.post("/generate-pdf", async function (req, res) {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).send("Content is required");
    }

    // Tạo PDF
    await genPDF(content, title);

    const filePath = `${title}.pdf`;

    // Gửi file cho client
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error while downloading the file:", err);

        // Nếu xảy ra lỗi khi gửi file, xóa file để tránh lưu trữ không cần thiết
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File deleted after download error:", filePath);
        }
        return res.status(500).send("Error downloading PDF");
      }

      // Xóa file sau khi gửi thành công
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File successfully sent and deleted:", filePath);
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

app.listen(3000, function () {
  console.log("ecApp is running at http://localhost:3000");
});
