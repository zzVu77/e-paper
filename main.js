import bcrypt from "bcryptjs";
import express from "express";
import { engine } from "express-handlebars";
import fs from "fs";
import Redis from "ioredis";
import otp_generator from "otp-generator";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import formatDateTime from "./helpers/formatDateTime.js";
import formatDate from "./helpers/formatDate.js";
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
import helmet from "helmet"; // Fix: 5.1, 5.2, 5.3, 5.4, 5.6 - Added for CSP and anti-clickjacking
import csurf from "csurf"; // Fix: 5.7 - Added for CSRF protection
import crypto from "crypto"; // Fix: 5.2, 5.3 - Added for nonce generation
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const redis = new Redis();
import session from "express-session";
import passport from "./auth/config/passportConfig.js";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import authMiddleware from "./auth/middlewares/authMiddleware.js";

import Handlebars from "handlebars";
import dotenv from "dotenv";
import https from "https";
import path from 'path';

// Đường dẫn đến key và cert
const sslKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'));
const sslCert = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'));

const httpsOptions = {
  key: sslKey,
  cert: sslCert,
};

// Tạo server HTTPS
const httpsServer = https.createServer(httpsOptions, app);

// Chạy server trên cổng 443 hoặc cổng bạn muốn
const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});
dotenv.config();

// Fix: 5.5 - Cross-Domain Misconfiguration (Restrict CORS to specific origin)
app.use(cors({
  origin: 'https://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Fix: 5.1 - CSP Wildcard Directive, 5.4 - CSP Header Not Set, 5.6 - Missing Anti-Clickjacking Header
// Note: 5.2 and 5.3 (unsafe-inline) require template changes; nonce added here for future use
app.use((req, res, next) => {
  // Tạo nonce mới cho mỗi request để tăng bảo mật
  res.locals.nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  next();
});

app.use((req, res, next) => {
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://kit.fontawesome.com",
        "https://cdn.jsdelivr.net",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com",
        (req, res) => `'nonce-${res.locals.nonce}'` // Cho phép inline scripts với nonce
      ],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      frameSrc: [
        "https://www.google.com",
        "https://www.gstatic.com",
      ],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      imgSrc: ["*", "data:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      styleSrcAttr: ["'none'"], // Không cho phép inline styles
      scriptSrcAttr: ["'none'"], // Không cho phép inline scripts
      upgradeInsecureRequests: []
    }
  })(req, res, next);
});

app.use(helmet.frameguard({ action: 'deny' })); // Fix: 5.6 - Additional anti-clickjacking protection
app.use(helmet.xssFilter()); // Enable XSS filter
app.use(helmet.noSniff()); // Prevent MIME-type sniffing

app.use(express.json());
app.use(
  session({
    secret: Buffer.from(process.env.SESSION_SECRET, "base64").toString("utf-8"),
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true, // Fix: Ensure HTTPS-only cookies
      sameSite: 'strict', // Fix: Prevent CSRF
      httpOnly: true, // Fix: Prevent client-side access
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Fix: 5.7 - Absence of Anti-CSRF Tokens
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

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
      format_date: formatDate,
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

// Setup local data for navigation
app.use(async function (req, res, next) {
  const currentCategory = req.query.categoryname || "";
  try {
    const categories = await categoryService.getCategoryName();
    const listCategory = [];

    let parentCat = "";
    if (currentCategory) {
      try {
        parentCat = await categoryService.getParentCategory(currentCategory);
      } catch (error) {
        console.warn(`Failed to fetch parent category for ${currentCategory}: ${error.message}`);
        parentCat = ""; // Fallback to empty string if category not found
      }
    }

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

    res.locals.categories = listCategory;
    res.locals.user = req.user;
    console.log("Session data:", req.session);
    console.log("User data:", req.user);
    next();
  } catch (error) {
    console.error("Error in navigation middleware:", error.message);
    next(error); // Pass error to global error handler
  }
});

// Routes
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
  res.render("login", { layout: "default", csrfToken: res.locals.csrfToken, nonce: res.locals.nonce });
});

app.get("/signup", function (req, res) {
  res.render("signup", { layout: "default", csrfToken: res.locals.csrfToken, nonce: res.locals.nonce });
});

app.get("/forgot-password", function (req, res) {
  res.render("forgotPassword", { layout: "default", csrfToken: res.locals.csrfToken, nonce: res.locals.nonce });
});

app.get("/verify-otp", function (req, res) {
  res.render("verify-otp", { layout: "default", csrfToken: res.locals.csrfToken, nonce: res.locals.nonce });
});

app.use(
  "/admin/categories",
  authMiddleware.authAdmin,
  categoriesmanagementRouter
);
app.use("/admin/tags", authMiddleware.authAdmin, tagsmanagementRouter);
app.use("/admin", authMiddleware.authAdmin, personsmanagementRouter);
app.use("/admin/articles", authMiddleware.authAdmin, articlesmanagementRouter);
app.use("/posts", postsRouter);
app.use("/account-setting", accountSettingRouter);

app.get("/", async (req, res) => {
  try {
    res.render("home", {
      popularPosts: await articleService.getTopTrendingArticles(),
      mostViewed: await articleService.getMostViewedArticles(),
      latestPosts: await articleService.getLatestArticles(),
      topCategories: await articleService.getLatestArticleOfTopCategories(),
      slideshow: await articleService.getImageUrlOfTop3Article(),
    });
  } catch (error) {
    console.error("Error rendering home page:", error.message);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

app.use("/editor", authMiddleware.authEditor, editormanagementRouter);
app.use("/account", accountmanagementRouter);
app.use("/auth", authRoutes);

app.post("/generate-pdf", async function (req, res) {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).send("Content is required");
    }

    await genPDF(content, title);
    const filePath = `${title}.pdf`;

    res.download(filePath, (err) => {
      if (err) {
        console.error("Error while downloading the file:", err);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("File deleted after download error:", filePath);
        }
        return res.status(500).send("Error downloading PDF");
      }

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
    console.log("Sending email to:", email);
    const otpcode = otp_generator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      alphabets: false,
    });
    const validTime = 10; // OTP valid for 10 minutes
    const key = `otp:${email}`;
    await redis.set(key, otpcode, "EX", 60 * validTime);
    const value = await redis.get(key);
    console.log("Generated OTP:", value);
    res.json({
      success: true,
      otp: otpcode,
      validTime: validTime,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.post("/reset-password", async function (req, res) {
  try {
    const { otp, password, email } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const value = await redis.get(`otp:${email}`);
    
    if (value === otp) {
      const result = await accountService.updatePassword(email, hashPassword);
      if (result.success) {
        console.log("Password changed successfully");
        await redis.del(`otp:${email}`);
        res.json({
          status: "success",
          message: "Password changed successfully",
        });
      } else {
        console.log("Password update failed:", result.errorMessage);
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
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ status: "failed", message: "Internal server error" });
  }
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).render("error", {
    layout: "default",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});