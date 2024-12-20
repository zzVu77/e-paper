import express from "express";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid"; // Import hàm v4 từ uuid
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';


const router = express.Router();
// Tạo __dirname thủ công
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", async function (req, res) {
  const list = await categoryService.getAll();
  res.render("writer/article-writer-textEditor", {
    categoryListName: JSON.stringify(list),
    categoryList: list,

  });
  // console.log(JSON.stringify(list));
});




router.post("/", async function (req, res) {
  try {

    // Tạo dữ liệu bài viết
    const articleId = uuidv4(); // Sinh ID ngẫu nhiên cho bài viết

    //Thumbnail bài viết
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // Sử dụng path.join để đảm bảo đường dẫn chính xác trong folder project
        cb(null, path.join(__dirname, '../../public/img'));
      },
      filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname); // Lấy đuôi file
        const filename = `${articleId}${fileExtension}`; // Tạo tên file
        cb(null, filename);    
      },
    });
    const upload = multer({ storage });

    // Sử dụng middleware để xử lý upload
    //  Chạy upload.single('image_url') như một Promise để đảm bảo bất đồng bộ được xử lý đúng
     await new Promise((resolve, reject) => {
      upload.single('image_url')(req, res, (err) => {
        if (err) {
          reject(err); // Nếu có lỗi thì reject
        } else {
          resolve(); // Nếu thành công thì resolve
        }
      });
    });
    console.log(req.body);
    const categoryName = req.body.category; // Lấy tên danh mục từ request body
    // Tìm categoryId dựa trên tên danh mục
    const categoryId = await categoryService.getCategoryIdByName(categoryName);
    if (!categoryId) {
      console.log('Not found categoryID');
    }
    // console.log(categoryId);

    // Sau khi upload thành công, lấy tên file ảnh từ req
    const fileExtension = path.extname(req.file.originalname); // Lấy đuôi file ảnh
    const imageUrl = `/img/${articleId}${fileExtension}`; // Đường dẫn hình ảnh
    console.log(imageUrl);
    console.log(fileExtension);
    const articleData = {   
      id: articleId,
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
    };

    await articleService.add(articleData); // Thêm bài viết vào database

    // Xử lý tags
    const tags = req.body.tags || []; // Lấy mảng tags từ request body
    // console.log(req.body.tags);
    if (tags.length > 0) {
      for (const tagName of tags) {
        let tag = await tagService.getTagByName(tagName); // Kiểm tra tag có tồn tại trong bảng tags không
        let tagId;
        if (!tag) {
          // Nếu không tồn tại, thêm tag mới vào bảng tags
          tagId = uuidv4();
          await tagService.add({ id: tagId, name: tagName });
        } else {
          tagId = tag.id; // Lấy ID của tag nếu đã tồn tại
        }

        // Thêm liên kết vào bảng article_tags
        await articleTagsService.add({ article_id: articleId, tag_id: tagId });
        // console.log({ article_id: articleId, tag_id: tagId });
      }
    }

    // res.status(201).json({ message: "Article and tags successfully added!" });
  } catch (error) {
    console.error("Error: ", error);
  }
  res.redirect("/writer/article/manage/PendingArticle");
});




export default router;