import express from "express";
import { query, body, validationResult } from "express-validator";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import authMiddleware from "../../auth/middlewares/authMiddleware.js";
import userService from "../../services/user.service.js";
import rejectionNoteService from "../../services/rejectionNote.service.js";

const router = express.Router();

// Tạo __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// GET / - Render article edit page
router.get(
  "/",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("id")
      .optional()
      .isString()
      .withMessage("Article ID must be a valid string"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const id = req.query.id || 0;
    const user = await userService.getById(req.user.id);
    
    if (id !== 0) {
      const article = await articleService.findById(id);
      if (!article) {
        return res.status(404).json({ error: "Article not found." });
      }
      
      const articleList = await categoryService.getAll();
      const categoryName = await categoryService.getCategoryNameById(
        article.category_id
      );
      
      let rejectionNotes = [];
      rejectionNotes[0] = null;
      let editor = [];
      editor[0] = {};
      editor[0].name = null;
      
      if (article.status === "rejected") {
        rejectionNotes = await rejectionNoteService.getByArticleId(article.id);
        if (rejectionNotes[0]?.editor_id) {
          editor = await userService.getById(rejectionNotes[0].editor_id);
        }
      }
      
      res.render("writer/article-writer-editTextEditor", {
        article: article,
        categoryName: categoryName,
        categoryListName: JSON.stringify(articleList),
        categoryList: articleList,
        authorID: user[0].id,
        rejectionNotes: rejectionNotes[0],
        editor: editor[0].name,
      });
    } else {
      const articleList = await categoryService.getAll();
      res.render("writer/article-writer-editTextEditor", {
        article: null,
        categoryName: null,
        categoryListName: JSON.stringify(articleList),
        categoryList: articleList,
        authorID: user[0].id,
        rejectionNotes: null,
        editor: null,
      });
    }
  }
);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/img'));
  },
  filename: function (req, file, cb) {
    const tempFilename = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, tempFilename);
  },
});

// Multer file filter to validate image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST / - Update or create an article
router.post(
  "/",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  upload.single("image_url"),
  [
    body("id")
      .exists()
      .isString()
      .withMessage("Article ID must be a valid string"),
    body("category")
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Category must be a non-empty string")
      .isLength({ max: 255 })
      .withMessage("Category must not exceed 255 characters"),
    body("title")
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Title must be a non-empty string")
      .isLength({ max: 255 })
      .withMessage("Title must not exceed 255 characters"),
    body("abstract")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Abstract must not exceed 1000 characters"),
    body("content")
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Content must be a non-empty string"),
    body("status")
      .exists()
      .isIn(['draft', 'pending', 'published', 'rejected'])
      .withMessage("Status must be one of: draft, pending, published, rejected"),
    body("premium")
      .optional()
      .isIn(['on', undefined])
      .withMessage("Premium must be 'on' or undefined"),
    body("author")
      .exists()
      .isString()
      .withMessage("Author ID must be a valid string"),
    body("current_image_url")
      .optional()
      .isString()
      .matches(/^\/img\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif)$/i)
      .withMessage("Current image URL must be a valid image path"),
  ],
  handleValidationErrors,
  async function (req, res) {
    try {
      const categoryName = req.body.category;
      const categoryId = await categoryService.getCategoryIdByName(categoryName);
      if (!categoryId) {
        return res.status(404).json({ error: "Category not found." });
      }

      let imageUrl = req.body.current_image_url;

      if (req.file) {
        const fileExtension = path.extname(req.file.originalname);
        const newFilename = `${req.body.id}${fileExtension}`;
        const newFilePath = path.join(__dirname, '../../public/img', newFilename);
        fs.renameSync(req.file.path, newFilePath);
        imageUrl = `/img/${newFilename}`;
      }

      const articleData = {
        id: req.body.id,
        title: req.body.title,
        abstract: req.body.abstract || null,
        content: req.body.content,
        image_url: imageUrl,
        status: req.body.status,
        category_id: categoryId.id,
        is_premium: req.body.premium === "on",
        views: 0,
        publish_date: null,
        author: req.body.author,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      await articleService.patch(req.body.id, articleData);

      res.redirect("/writer/article/manage/DraftArticle");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;