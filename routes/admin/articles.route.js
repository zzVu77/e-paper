import express from "express";
import { body, query, validationResult } from "express-validator";
import adminService from "../../services/admin/article-admin.service.js";

const router = express.Router();

// Middleware: handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("Validation failed:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /admin/articles?page=x
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("id")
      .optional()
      .isUUID()
      .withMessage("Invalid category ID"),
    handleValidationErrors,
  ],
  async function (req, res) {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 4;
    const offset = (currentPage - 1) * itemsPerPage;

    let data = await adminService.getPageArticles(itemsPerPage, offset);
    const categories = await adminService.getAllCategories();

    data = data.map((article) => {
      let statusClass = "";

      switch (article.article_status) {
        case "published":
          statusClass = "tw-bg-green-400 tw-text-white tw-rounded-lg tw-text-center tw-text-base";
          break;
        case "draft":
          statusClass = "tw-bg-yellow-400 tw-text-white tw-rounded-lg tw-text-center tw-text-base";
          break;
        case "rejected":
          statusClass = "tw-bg-red-500 tw-text-white tw-rounded-lg tw-text-center tw-text-base";
          break;
        case "pending":
          statusClass = "tw-bg-cyan-200 tw-text-black tw-rounded-lg tw-text-center tw-text-base";
          break;
      }

      return {
        ...article,
        categories: categories,
        statusClass,
      };
    });

    const totalArticles = await adminService.getTotalArticles();
    const totalItems = totalArticles.count;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

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

    res.render("admin/articles", {
      layout: "admin",
      title: "Articles",
      data: data,
      pageNumbers,
      catId: req.query.id || "",
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage + 1,
      prevPage: currentPage - 1,
    });
  }
);

// POST /admin/articles/update
router.post(
  "/update",
  [
    body("article_id").isUUID().withMessage("Invalid article ID"),
    body("categories").optional().isArray().withMessage("Categories must be an array"),
    body("tag").optional().isString().trim().escape(),
    body("reason").optional().isString().trim().escape(),
    body("decision").isIn(["approve", "reject"]).withMessage("Decision must be approve or reject"),
    handleValidationErrors,
  ],
  async (req, res) => {
    const { article_id, tag, categories, reason, decision } = req.body;
    const admin_id = "1"; // Consider dynamically assigning this later
    try {
      await adminService.updateArticle(admin_id, article_id, tag, categories, reason, decision);
      res.redirect("/admin/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send("Something went wrong while updating the article.");
    }
  }
);

// POST /admin/articles/del
router.post(
  "/del",
  [
    body("id").isUUID().withMessage("Invalid article ID"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const articleId = req.body.id;
      const result = await adminService.deleteArticle(articleId);

      if (result.success) {
        res.redirect("/admin/articles");
      } else {
        res.status(500).send("Error deleting the article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).send("Internal server error");
    }
  }
);

export default router;
