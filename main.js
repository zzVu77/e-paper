import bcrypt from "bcryptjs";
import express from "express";
import { engine } from "express-handlebars";
import fs from "fs";
import Redis from "ioredis";
import otp_generator from "otp-generator";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import formatDateTime from "./helpers/formatDateTime.js";
import genPDF from "./public/js/genPDF.js";
import accountmanagementRouter from "./routes/account.route.js";
import articlesmanagementRouter from "./routes/admin/articles.route.js";
import writerArticleMangeRouter from "./routes/writer/articleMange.route.js";
import writerCreateArticle from "./routes/writer/createArticle.route.js";
import writerEditArticle from "./routes/writer/editArticle.route.js";
import categoriesmanagementRouter from "./routes/admin/categories.route.js";
import personsmanagementRouter from "./routes/admin/persons.route.js";
import tagsmanagementRouter from "./routes/admin/tags.route.js";
import editormanagementRouter from "./routes/editor.route.js";
import accountSettingRouter from "./routes/account-setting.route.js";
import postsRouter from "./routes/posts.route.js";
import articleService from "./services/article.service.js";
import categoryService from "./services/category.service.js";
import accountService from "./services/account.service.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const redis = new Redis();
import session from "express-session";
import passport from "./auth/config/passportConfig.js";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
// import { ensureAuthenticated } from "./auth/middlewares/authMiddleware.js";
import Handlebars from "handlebars";
import dotenv from "dotenv";
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: Buffer.from(process.env.SESSION_SECRET, "base64").toString("utf-8"),
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

Handlebars.registerHelper("json", function (context) {
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
      isEqual(value1, value2) {
        return value1 === value2;
      },
      splitToArray(str) {
        if (!str) return []; // Nếu chuỗi không tồn tại, trả về mảng rỗng
        return str.split(",").map((item) => item.trim()); // Tách chuỗi và loại bỏ khoảng trắng
      },
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
  const currentCategory = req.query.categoryname || "";
  console.log("Current Category: ", currentCategory);
  const categories = await categoryService.getCategoryName();
  const listCategory = [];

  const parentCat = currentCategory
    ? await categoryService.getParentCategory(currentCategory)
    : "";
  // const parentCat = "";
  console.log("parent", parentCat);

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
app.use("/writer/article/manage", writerArticleMangeRouter);
app.use("/writer/article/create", writerCreateArticle);
app.use("/writer/article/edit", writerEditArticle);

app.get("/features", function (req, res) {
  res.render("features");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/admin", function (req, res) {
  res.render("admin/dashboard", { layout: "admin", title: "Admin Dashboard" });
});

app.get("/login", function (req, res) {
  res.render("login", { layout: "default" });
});

app.get("/signup", function (req, res) {
  res.render("signup", { layout: "default" });
});
app.get("/account-setting-myprofile", function (req, res) {
  res.render("account-setting-myprofile");
});
app.get("/account-setting-security", function (req, res) {
  res.render("account-setting-security", { user: req.user });
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

// function groupArticlesByTags(data) {
//   const groupedData = [];

//   data.forEach((item) => {
//     // Tìm bài viết trong danh sách groupedData
//     const existingArticle = groupedData.find(
//       (article) => article.id === item.id
//     );

//     if (existingArticle) {
//       // Nếu bài viết đã tồn tại, thêm tag vào mảng tags
//       existingArticle.tags.push(item.tag_name);
//     } else {
//       // Nếu chưa tồn tại, thêm bài viết mới với mảng tags
//       groupedData.push({
//         id: item.id,
//         authorId: item.author,
//         title: item.title,
//         abstract: item.abstract,
//         content: item.content,
//         updated_at: item.updated_at,
//         tags: [item.tag_name], // Mảng chứa các tag ban đầu
//         status: item.status,
//         is_premium: item.is_premium,
//       });
//     }
//   });

//   return groupedData;
// }
// app.get('/admin/tags', function (req, res) {
//   res.render('admin/tags', { layout: 'admin', title: 'Tags' });
// });
app.use("/admin/categories", categoriesmanagementRouter);
app.use("/admin/tags", tagsmanagementRouter);
app.use("/admin/persons", personsmanagementRouter);
app.use("/admin/articles", articlesmanagementRouter);
app.use("/posts", postsRouter);
app.use("/account-setting", accountSettingRouter);

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

app.post("/send-email", async function (req, res) {
  try {
    const { email } = req.body;
    console.log("Demo email", email);
    const otpcode = otp_generator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      alphabets: false, // Loại bỏ ký tự chữ, chỉ giữ chữ số
    });
    console.log(otpcode);
    const validTime = 10; // Thời gian hợp lệ của mã OTP (phút)
    const key = `otp:${email}`;
    redis.set(key, otpcode, "EX", 60 * validTime); // Lưu mã OTP vào Redis với thời gian hết hạn
    const value = await redis.get(key);
    console.log("redis: ", value);
    res.json({
      success: true,
      otp: otpcode,
      validTime: validTime,
    });
  } catch (error) {
    alert("Failed to send email.");
  }
});
app.post("/reset-password", async function (req, res) {
  const { otp, password, email } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const value = await redis.get(`otp:${email}`);
  if (value === otp) {
    const result = await accountService.updatePassword(email, hashPassword);
    console.log(result);
    if (result.success) {
      console.log("Password changed successfully");
      await redis.del(`otp:${email}`);
      res.json({
        status: "success",
        message: "Password changed successfully",
      });
    } else {
      console.log(result.errorMessage);
      res.json({
        status: "failed",
        message: result.errorMessage,
      });
    }
  } else {
    console.log("OTP is incorrect");
    res.json({
      status: "failed",
      message: "OTP is incorrect",
    });
  }
});

app.listen(3000, function () {
  console.log("ecApp is running at http://localhost:3000");
});
