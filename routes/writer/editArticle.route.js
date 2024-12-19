import express from "express";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid"; // Import hàm v4 từ uuid
import moment from "moment";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
const router = express.Router();
// Tạo __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.get("/", async function (req, res) {
  const id = req.query.id || 0;

  if (id != 0) {
    const article = await articleService.findById(id);
    const articleList = await categoryService.getAll();
    console.log(article);

    const categoryName = await categoryService.getCategoryNameById(
      article.category_id
    );
    // console.log(categoryName);

    res.render("article-writer-editTextEditor", {
      article: article,
      categoryName: categoryName,
      categoryListName: JSON.stringify(articleList),
      categoryList: articleList,
    });
  }
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/img'));
  },
  filename: function (req, file, cb) {
    // Tạo tên file tạm thời
    const tempFilename = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, tempFilename);
  },
});

const upload = multer({ storage });

// Middleware xử lý upload
// router.post("/", upload.single("image_url"), async function (req, res) {
//   try {
//     // Đảm bảo `req.body` đã có dữ liệu
//     const categoryName = req.body.category;

//     // Tìm `categoryId`
//     const categoryId = await categoryService.getCategoryIdByName(categoryName);
//     if (!categoryId) {
//       return res.status(404).json({ error: "Category not found." });
//     }

//     // Đường dẫn file ảnh mới
//     const fileExtension = path.extname(req.file.originalname);
//     const newFilename = `${req.body.id}${fileExtension}`;
//     const newFilePath = path.join(__dirname, '../../public/img', newFilename);

//     // Đổi tên file
//     fs.renameSync(req.file.path, newFilePath);

//     const imageUrl = `/img/${newFilename}`; // Đường dẫn mới

//     // Tiếp tục xử lý lưu vào database
//     const articleData = {
//       id: req.body.id,
//       title: req.body.title,
//       abstract: req.body.abstract || null,
//       content: req.body.content,
//       image_url: imageUrl,
//       status: req.body.status,
//       category_id: categoryId.id,
//       is_premium: req.body.premium === "on",
//       views: 0,
//       publish_date: null,
//       author: req.body.author,
//       updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
//     };

//     await articleService.patch(req.body.id, articleData);

//     // Xử lý tags và các logic khác
//     res.redirect("/writer/article/manage/pending");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });
router.post("/", upload.single("image_url"), async function (req, res) {
  try {
    // Lấy thông tin từ body
    const categoryName = req.body.category;

    // Tìm `categoryId`
    const categoryId = await categoryService.getCategoryIdByName(categoryName);
    if (!categoryId) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Xử lý ảnh
    let imageUrl = req.body.current_image_url; // Giá trị mặc định là ảnh hiện tại

    if (req.file) {
      // Đường dẫn file ảnh mới
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `${req.body.id}${fileExtension}`;
      const newFilePath = path.join(__dirname, '../../public/img', newFilename);

      // Đổi tên file
      fs.renameSync(req.file.path, newFilePath);

      imageUrl = `/img/${newFilename}`; // Cập nhật đường dẫn mới
    }

    // Cập nhật dữ liệu bài viết
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

    // Xử lý tags và các logic khác
    res.redirect("/writer/article/manage/PendingArticle");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});


export default router;