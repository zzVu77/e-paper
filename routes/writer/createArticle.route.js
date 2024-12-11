import express from "express";
import categoryService from "../../services/category.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import articleService from "../../services/article.service.js";
import { v4 as uuidv4 } from "uuid"; // Import hàm v4 từ uuid

const router = express.Router();

router.get("/", async function (req, res) {
  const list = await categoryService.getAll();
  res.render("article-writer-textEditor", {
    categoryListName: JSON.stringify(list),
    categoryList: list,

  });
  // console.log(JSON.stringify(list));
});
router.post("/", async function (req, res) {
  try {
    const categoryName = req.body.category; // Lấy tên danh mục từ request body

    // Tìm categoryId dựa trên tên danh mục
    const categoryId = await categoryService.getCategoryIdByName(categoryName);
    if (!categoryId) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Tạo dữ liệu bài viết
    const articleId = uuidv4(); // Sinh ID ngẫu nhiên cho bài viết
    const articleData = {
      id: articleId,
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
    console.error("Error adding article and tags:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the article and tags." });
  }
  res.redirect("/writer/article/manage/pending");
});
export default router;