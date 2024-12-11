import express from "express";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid"; // Import hàm v4 từ uuid
import moment from "moment";

const router = express.Router();

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
router.post("/", async function (req, res) {
  try {
    const categoryName = req.body.category; // Lấy tên danh mục từ request body
    console.log(req.body)
    // Tìm categoryId dựa trên tên danh mục
    const categoryId = await categoryService.getCategoryIdByName(categoryName);
    if (!categoryId) {
      return res.status(404).json({ error: "Category not found." });
    }
    // console.log("categoryTag");
    const articleData = {
      id: req.body.id,
      title: req.body.title,
      abstract: req.body.abstract || null,
      content: req.body.content,
      image_url: req.body.image_url || null,
      status: req.body.status,
      category_id: categoryId.id,
      is_premium: req.body.premium === "on",
      views: 0,
      publish_date: null,
      author: req.body.author,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"), // Format thời gian hiện tại
    };

    // Cập nhật bài viết trong database
    await articleService.patch(req.body.id, articleData);
    // console.log("patch article data");

    // Xóa liên kết cũ từ bảng article_tags
    await articleTagsService.deleteByArticleId(req.body.id);
    // console.log("delete link article tags");

    // Xử lý tags
    const tags = req.body.tags || []; // Lấy mảng tags từ request body
    // console.log('Tags from request:', tags);

    if (tags.length > 0) {
      for (const tagName of tags) {
        let tag = await tagService.getTagByName(tagName); // Kiểm tra tag trong bảng tags
        let tagId;
        if (!tag) {
          // Thêm tag mới nếu chưa tồn tại
          tagId = uuidv4();
          await tagService.add({ id: tagId, name: tagName });
        } else {
          tagId = tag.id;
        }

        // Thêm liên kết vào bảng article_tags
        await articleTagsService.add({
          article_id: req.body.id,
          tag_id: tagId,
        });
      }
    }

    res.redirect("/writer/article/manage/pending");
  } catch (error) {
    console.error("Error in /article-writer-editTextEditor:", error);

    // Gửi lỗi chi tiết về client để debug (tránh làm lộ lỗi trên production)
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});
export default router;