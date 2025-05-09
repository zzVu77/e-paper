import express from "express";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import authMiddleware from "../../auth/middlewares/authMiddleware.js";
import userService from "../../services/user.service.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình Multer (upload ảnh)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/img'));
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// GET: hiển thị giao diện soạn thảo bài viết
router.get("/", authMiddleware.ensureAuthenticated, authMiddleware.ensureWriter, async function (req, res) {
  try {
    const categories = await categoryService.getAll();
    const user = await userService.getById(req.user.id);
    res.render("writer/article-writer-textEditor", {
      categoryListName: JSON.stringify(categories),
      categoryList: categories,
      authorID: user[0].id,
    });
  } catch (err) {
    console.error("Error loading article editor:", err);
    res.status(500).send("Internal Server Error");
  }
});

// POST: tạo bài viết mới
router.post("/", authMiddleware.ensureWriter, upload.single("image_url"), async function (req, res) {
  try {
    const articleId = uuidv4();

    const categoryName = req.body.category;
    const categoryIdObj = await categoryService.getCategoryIdByName(categoryName);
    const categoryId = categoryIdObj?.id;

    if (!categoryId) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const fileExtension = path.extname(req.file.originalname);
    const imageUrl = `/img/${req.file.filename}`;

    const articleData = {
      id: articleId,
      title: req.body.title,
      abstract: req.body.abstract || null,
      content: req.body.content,
      image_url: imageUrl,
      status: req.body.status,
      category_id: categoryId,
      is_premium: req.body.premium === "on",
      views: 0,
      publish_date: null,
      author: req.body.author,
    };

    await articleService.add(articleData);

    // Xử lý tags
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    for (const tagName of tags) {
      let tag = await tagService.getTagByName(tagName);
      let tagId;

      if (!tag) {
        tagId = uuidv4();
        await tagService.add({ id: tagId, name: tagName });
      } else {
        tagId = tag.id;
      }

      await articleTagsService.add({ article_id: articleId, tag_id: tagId });
    }

    res.redirect("/writer/article/manage/DraftArticle");
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).send("An error occurred while creating the article.");
  }
});

export default router;
