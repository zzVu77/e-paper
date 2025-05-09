import express from "express";
import { body, query, validationResult } from "express-validator";
import editorService from "../services/editor.service.js";

const router = express.Router();

// Route GET /: Hiển thị danh sách bài viết của biên tập viên
router.get("/", async function (req, res) {
  const id_editor = req.user.id;

  const currentPage = parseInt(req.query.page) || 1;
  const itemsPerPage = 5;
  const offset = (currentPage - 1) * itemsPerPage;

  const status = req.query.status || null; // Lọc bài viết theo trạng thái

  // Fetch filtered articles based on status
  let data = await editorService.getPageArticles(
    itemsPerPage,
    offset,
    id_editor,
    status
  );

  // Fetch categories as usual
  const categories = await editorService.getAllCategories();

  // Attach categories to each article
  data = data.map((article) => ({
    ...article,
    categories: categories,
  }));

  // Fetch total articles count (filtered by editor_id and possibly status)
  const totalArticles = await editorService.getTotalArticles(id_editor, status);
  const totalItems = totalArticles.count;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination logic
  const maxVisiblePages = 5;
  const pageNumbers = [];

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push({ value: i, active: i === currentPage });
  }

  console.log(data);
  // Render the editor page with filtered articles and pagination
  res.render("editor", {
    layout: "editor",
    title: "Editor",
    data: data,
    pageNumbers,
    catId: req.query.id || "",
    status: status || "", // Pass status filter to the view
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage: currentPage + 1,
    prevPage: currentPage - 1,
  });
});

// Route POST /update: Cập nhật thông tin bài viết
router.post(
  "/update",
  [
    body("article_id")
      .isInt({ gt: 0 })
      .withMessage("ID bài viết phải là một số nguyên dương."),

    body("tag")
      .optional()
      .isString()
      .withMessage("Tag phải là một chuỗi ký tự.")
      .isLength({ max: 100 })
      .withMessage("Tag không được dài quá 100 ký tự."),

    body("categories")
      .isArray()
      .withMessage("Danh sách thể loại phải là một mảng.")
      .custom((value) => {
        if (value.some((category) => typeof category !== "number")) {
          throw new Error("Các thể loại phải là số.");
        }
        return true;
      }),

    body("reason")
      .optional()
      .isString()
      .withMessage("Lý do phải là một chuỗi.")
      .isLength({ max: 500 })
      .withMessage("Lý do không được dài quá 500 ký tự."),

    body("decision")
      .optional()
      .isString()
      .withMessage("Quyết định phải là một chuỗi.")
      .isLength({ max: 100 })
      .withMessage("Quyết định không được dài quá 100 ký tự."),

    body("publish_date")
      .optional()
      .isDate({ format: "YYYY-MM-DD" })
      .withMessage("Ngày xuất bản không hợp lệ."),
  ],
  async (req, res) => {
    // Kiểm tra kết quả xác thực
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { article_id, tag, categories, reason, decision, publish_date } =
      req.body;
    const id_editor = req.user.id;

    try {
      await editorService.updateArticle(
        id_editor,
        article_id,
        tag,
        categories,
        reason,
        decision,
        publish_date
      );

      // Redirect to the editor page after updating
      res.redirect("/editor");
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send("Something went wrong while updating the article.");
    }
  }
);

export default router;
