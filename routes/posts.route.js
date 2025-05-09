import express from "express";
import { query, body, validationResult } from "express-validator";
import articleService from "../services/article.service.js";
import commentService from "../services/comment.service.js";
import userService from "../services/user.service.js";
import authMiddleware from "../auth/middlewares/authMiddleware.js";
import moment from 'moment';

const router = express.Router();

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

// GET / - Fetch all articles (no validation needed as no parameters)
router.get("/", async function (req, res) {
  try {
    const articles = await articleService.getAllArticles();
    res.render("posts", { articles: articles, title: "All posts" });
  } catch (error) {
    console.error("Error fetching all articles:", error.message);
    res.status(500).render("error", {
      message: "Unable to load articles",
      layout: "default",
    });
  }
});

// GET /byCat - Fetch articles by category with pagination
router.get(
  "/byCat",
  [
    query("categoryname")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Category name must be a non-empty string"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const name = req.query.categoryname || "";
    const current_page = req.query.page || 1;
    const limit = 6;
    const offSet = (current_page - 1) * limit;

    try {
      const total = await articleService.countArticlesByCategory(name);
      const totalPages = Math.ceil(total / limit);
      const pageNumber = [];
      const maxVisiblePage = 5;
      const calculatePossibleStartPage = Math.max(
        0,
        current_page - Math.floor(maxVisiblePage - 2)
      );
      const startPage =
        calculatePossibleStartPage < maxVisiblePage
          ? calculatePossibleStartPage
          : calculatePossibleStartPage - (calculatePossibleStartPage - maxVisiblePage);
      const endPage = Math.min(totalPages, startPage + maxVisiblePage);
      for (let i = startPage; i < endPage; i++) {
        pageNumber.push({
          value: i + 1,
          catName: name,
          active: i + 1 === parseInt(current_page),
        });
      }

      const isPremium = true;
      const articles = await articleService.getArticlesByCategory(
        name,
        limit,
        offSet,
        isPremium
      );
      res.render("posts", {
        hasPagination: totalPages > 1,
        articles: articles,
        title: name,
        catName: name,
        pageNumber: pageNumber,
        totalPages: totalPages,
        hasNextPage: current_page < totalPages,
        hasPreviousPage: current_page > 1,
        nextPage: parseInt(current_page) + 1,
        previousPage: parseInt(current_page) - 1,
        isByCategory: true,
      });
    } catch (error) {
      console.error(`Error fetching articles for category '${name}': ${error.message}`);
      res.status(404).render("posts", {
        hasPagination: false,
        articles: [],
        title: name,
        catName: name,
        pageNumber: [],
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: 1,
        previousPage: 1,
        isByCategory: true,
        error: "Category not found or unable to load articles",
      });
    }
  }
);

// GET /byTag - Fetch articles by tag with pagination
router.get(
  "/byTag",
  [
    query("name")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Tag name must be a non-empty string"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const name = req.query.name || "";
    const current_page = req.query.page || 1;
    const limit = 6;
    const offSet = (current_page - 1) * limit;
    
    try {
      const total = await articleService.countArticlesByTagName(name);
      const totalPages = Math.ceil(total / limit);
      const pageNumber = [];
      const maxVisiblePage = 5;
      const calculatePossibleStartPage = Math.max(
        0,
        current_page - Math.floor(maxVisiblePage - 2)
      );
      const startPage =
        calculatePossibleStartPage < maxVisiblePage
          ? calculatePossibleStartPage
          : calculatePossibleStartPage - (calculatePossibleStartPage - maxVisiblePage);
      const endPage = Math.min(totalPages, startPage + maxVisiblePage);
      for (let i = startPage; i < endPage; i++) {
        pageNumber.push({
          value: i + 1,
          tagName: name,
          active: i + 1 === parseInt(current_page),
        });
      }

      const isPremium = true;
      const articles = await articleService.getArticlesByTag(
        name,
        limit,
        offSet,
        isPremium
      );
      res.render("posts", {
        articles: articles,
        tagName: name,
        title: "#" + name,
        hasPagination: totalPages > 1,
        pageNumber: pageNumber,
        totalPages: totalPages,
        hasNextPage: current_page < totalPages,
        hasPreviousPage: current_page > 1,
        nextPage: parseInt(current_page) + 1,
        previousPage: parseInt(current_page) - 1,
        isByTagName: true,
      });
    } catch (error) {
      console.error(`Error fetching articles for tag '${name}': ${error.message}`);
      res.status(404).render("posts", {
        articles: [],
        tagName: name,
        title: "#" + name,
        hasPagination: false,
        pageNumber: [],
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: 1,
        previousPage: 1,
        isByTagName: true,
        error: "Tag not found or unable to load articles",
      });
    }
  }
);

// GET /search - Search articles by keyword with pagination
router.get(
  "/search",
  [
    query("keyword")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Keyword must be a non-empty string"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const keyword = req.query.keyword || "";
    const current_page = req.query.page || 1;
    const limit = 6;
    const offSet = (current_page - 1) * limit;
    
    try {
      const total = await articleService.countArticlesByKeyword(keyword);
      const totalPages = Math.ceil(total / limit);
      const pageNumber = [];
      const maxVisiblePage = 5;
      const calculatePossibleStartPage = Math.max(
        0,
        current_page - Math.floor(maxVisiblePage - 2)
      );
      const startPage =
        calculatePossibleStartPage < maxVisiblePage
          ? calculatePossibleStartPage
          : calculatePossibleStartPage - (calculatePossibleStartPage - maxVisiblePage);
      const endPage = Math.min(totalPages, startPage + maxVisiblePage);
      for (let i = startPage; i < endPage; i++) {
        pageNumber.push({
          value: i + 1,
          keyword: keyword,
          active: i + 1 === parseInt(current_page),
        });
      }

      const isPremium = true;
      const articles = await articleService.searchArticlesByKeyword(
        keyword,
        limit,
        offSet,
        isPremium
      );
      res.render("posts", {
        articles: articles,
        keyword: keyword,
        title: "#" + keyword,
        hasPagination: totalPages > 1,
        pageNumber: pageNumber,
        totalPages: totalPages,
        hasNextPage: current_page < totalPages,
        hasPreviousPage: current_page > 1,
        nextPage: parseInt(current_page) + 1,
        previousPage: parseInt(current_page) - 1,
        isByKeyword: true,
      });
    } catch (error) {
      console.error(`Error searching articles for keyword '${keyword}': ${error.message}`);
      res.status(404).render("posts", {
        articles: [],
        keyword: keyword,
        title: "#" + keyword,
        hasPagination: false,
        pageNumber: [],
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        nextPage: 1,
        previousPage: 1,
        isByKeyword: true,
        error: "Unable to load search results",
      });
    }
  }
);

// GET /detail - Fetch article details by ID
router.get(
  "/detail",
  [
    query("id")
      .exists()
      .isUUID()
      .withMessage("Article ID must be a valid UUID"),
  ],
  handleValidationErrors,
  async function (req, res) {
    try {
      let user = null;
      if (req.user) {
        user = await userService.getById(req.user.id);
      }
      const id = req.query.id;
      const listComment = await commentService.getCommentByArticleId(id);

      listComment.forEach((comment) => {
        comment.comment_date = moment(comment.comment_date).format(
          "MMMM Do YYYY, h:mm:ss a"
        );
      });

      const detail = await articleService.getArticleById(id);
      if (!detail) {
        return res.status(404).render("error", { message: "Article not found", layout: "default" });
      }

      if (detail.article_is_premium === 1) {
        if (!user) {
          return res.redirect("/login");
        }
        if (user[0].role === "guest") {
          return res.redirect("/account-setting/myprofile");
        }
      }

      const relatedArticles = await articleService.getRelatedArticleByCategory(
        detail.category_name,
        detail.article_id,
        6
      );

      res.render("article-detail", {
        article_id: detail.article_id,
        id: detail.article_id,
        title: detail.article_title,
        content: detail.article_content,
        img_url: detail.article_image_url,
        isPremium: detail.article_is_premium,
        author: detail.author_name,
        category: detail.category_name,
        tags: detail.article_tags,
        published_date: detail.article_publish_date,
        relatedArticles: relatedArticles,
        listComment: listComment,
        numberofComment: listComment.length,
      });
    } catch (error) {
      console.error(`Error fetching article details for ID '${req.query.id}': ${error.message}`);
      res.status(500).render("error", {
        message: "Unable to load article details",
        layout: "default",
      });
    }
  }
);

// POST /add-comment - Add a comment to an article
router.post(
  "/add-comment",
  authMiddleware.ensureAuthenticated,
  [
    body("articleId")
      .exists()
      .isUUID()
      .withMessage("Article ID must be a valid UUID"),
    body("content")
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Comment content must be a non-empty string")
      .isLength({ max: 1000 })
      .withMessage("Comment content must not exceed 1000 characters"),
    body("comment_date")
      .optional()
      .isISO8601()
      .withMessage("Comment date must be a valid ISO 8601 date"),
  ],
  handleValidationErrors,
  async function (req, res) {
    try {
      const userId = req.user.id;
      const { articleId, content, comment_date } = req.body;
      const result = await commentService.addComment(
        articleId,
        userId,
        content,
        comment_date
      );
      if (!result.success) {
        return res.json({
          success: false,
          message: "Unable to add comment",
          error: result.error,
        });
      }
      res.json({
        success: true,
        articleId,
        userId,
        content,
        comment_date,
        userName: result.userName,
      });
    } catch (error) {
      console.error(`Error adding comment for article '${req.body.articleId}': ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Unable to add comment",
        error: error.message,
      });
    }
  }
);

export default router;