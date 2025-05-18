import express from "express";
import { query, body, validationResult } from "express-validator";
import articleService from "../../services/article.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import authMiddleware from "../../auth/middlewares/authMiddleware.js";
import userService from "../../services/user.service.js";

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

// GET /AllArticle - Fetch all articles by author
router.get(
  "/AllArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    let current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;

    const nRows = await articleService.countAllArticlesByAuthorID(user[0].id);
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: i + 1 === +current_page,
        link: `/writer/article/manage/AllArticle?page=${i + 1}`,
      });
    }

    const list = await articleService.findPageByAuthorID(
      limit,
      offset,
      user[0].id
    );
    for (let article of list) {
      if (article.tags && typeof article.tags === "string") {
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + 1;
    const previousPage = Number(current_page) - 1;
    res.render("writer/article-manage-all", {
      list: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      isFirstPage: previousPage < 1,
      isLastPage: Number(current_page) === Number(nPages),
      pagnitionName: "all",
      nextLink: `/writer/article/manage/AllArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/AllArticle?page=${previousPage}`,
    });
  }
);

// GET /DraftArticle - Fetch draft articles by author
router.get(
  "/DraftArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    const status = "draft";
    let current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;

    const nRows = await articleService.countByStatusAndAuthorID(
      status,
      user[0].id
    );
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: i + 1 === +current_page,
        link: `/writer/article/manage/DraftArticle?page=${i + 1}`,
      });
    }

    const list = await articleService.findPageByStatusAndAuthorID(
      limit,
      offset,
      status,
      user[0].id
    );
    for (let article of list) {
      if (article.tags && typeof article.tags === "string") {
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + 1;
    const previousPage = Number(current_page) - 1;
    res.render("writer/article-manage-draft", {
      list: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      isFirstPage: previousPage < 1,
      isLastPage: Number(current_page) === Number(nPages),
      nextLink: `/writer/article/manage/DraftArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/DraftArticle?page=${previousPage}`,
    });
  }
);

// GET /PublishedArticle - Fetch published articles by author
router.get(
  "/PublishedArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    const status = "published";
    let current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;

    const nRows = await articleService.countByStatusAndAuthorID(
      status,
      user[0].id
    );
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: i + 1 === +current_page,
        link: `/writer/article/manage/PublishedArticle?page=${i + 1}`,
      });
    }

    const list = await articleService.findPageByStatusAndAuthorID(
      limit,
      offset,
      status,
      user[0].id
    );
    for (let article of list) {
      if (article.tags && typeof article.tags === "string") {
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + 1;
    const previousPage = Number(current_page) - 1;
    res.render("writer/article-manage-published", {
      list: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      isFirstPage: previousPage < 1,
      isLastPage: Number(current_page) === Number(nPages),
      nextLink: `/writer/article/manage/PublishedArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/PublishedArticle?page=${previousPage}`,
    });
  }
);

// GET /RejectedArticle - Fetch rejected articles by author
router.get(
  "/RejectedArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    const status = "rejected";
    let current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;

    const nRows = await articleService.countByStatusAndAuthorID(
      status,
      user[0].id
    );
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: i + 1 === +current_page,
        link: `/writer/article/manage/RejectedArticle?page=${i + 1}`,
      });
    }

    const list = await articleService.findPageByStatusAndAuthorID(
      limit,
      offset,
      status,
      user[0].id
    );
    for (let article of list) {
      if (article.tags && typeof article.tags === "string") {
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + 1;
    const previousPage = Number(current_page) - 1;
    res.render("writer/article-manage-rejected", {
      list: list,
      empty: list.length === 0,
      isFirstPage: previousPage < 1,
      pageNumbers: pageNumbers,
      isLastPage: Number(current_page) === Number(nPages),
      nextLink: `/writer/article/manage/RejectedArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/RejectedArticle?page=${previousPage}`,
    });
  }
);

// GET /PendingArticle - Fetch pending articles by author
router.get(
  "/PendingArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    const status = "pending";
    let current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;

    const nRows = await articleService.countByStatusAndAuthorID(
      status,
      user[0].id
    );
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: i + 1 === +current_page,
        link: `/writer/article/manage/PendingArticle?page=${i + 1}`,
      });
    }

    const list = await articleService.findPageByStatusAndAuthorID(
      limit,
      offset,
      status,
      user[0].id
    );
    for (let article of list) {
      if (article.tags && typeof article.tags === "string") {
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + 1;
    const previousPage = Number(current_page) - 1;
    res.render("writer/article-manage-pending", {
      list: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      isFirstPage: previousPage < 1,
      isLastPage: Number(current_page) === Number(nPages),
      nextLink: `/writer/article/manage/PendingArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/PendingArticle?page=${previousPage}`,
    });
  }
);

// GET /AllArticle-filter - Fetch filtered articles by author
router.get(
  "/AllArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("tags")
      .optional()
      .isString()
      .trim()
      .withMessage("Tags must be a comma-separated string"),
    query("startCreateDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endCreateDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
    query("searchKeyWord")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Search keyword must not exceed 255 characters"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const tags = req.query.tags;
    const startDate = req.query.startCreateDate || null;
    const endDate = req.query.endCreateDate || null;
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    const rawSearchKeyWord = req.query.searchKeyWord || "";
    const searchKeyWord = decodeURIComponent(rawSearchKeyWord).split("?page=")[0].trim();
    const status = "all";
    const user = await userService.getById(req.user.id);

    try {
      const limit = 3;
      let current_page = req.query.page || 1;
      const offset = (current_page - 1) * limit;

      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag);
          return tagData ? tagData.id : null;
        })
      );
      const validTagIDs = tagIDs.filter((id) => id !== null);

      let list = [];
      if (startDate && endDate) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate),
          new Date(endDate),
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      } else {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          startDate,
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        if (article.tags && typeof article.tags === "string") {
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate,
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${i + 1}`,
        });
      }

      const nextPage = Number(current_page) + 1;
      const previousPage = Number(current_page) - 1;
      res.render("writer/article-manage-all", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${nextPage}`,
        previousLink: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /PublishedArticle-filter - Fetch filtered published articles
router.get(
  "/PublishedArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("tags")
      .optional()
      .isString()
      .trim()
      .withMessage("Tags must be a comma-separated string"),
    query("startCreateDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endCreateDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
    query("searchKeyWord")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Search keyword must not exceed 255 characters"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const tags = req.query.tags;
    const startDate = req.query.startCreateDate || null;
    const endDate = req.query.endCreateDate || null;
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    const rawSearchKeyWord = req.query.searchKeyWord || "";
    const searchKeyWord = decodeURIComponent(rawSearchKeyWord).split("?page=")[0].trim();
    const status = "published";
    const user = await userService.getById(req.user.id);

    try {
      const limit = 5;
      let current_page = req.query.page || 1;
      const offset = (current_page - 1) * limit;

      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag);
          return tagData ? tagData.id : null;
        })
      );
      const validTagIDs = tagIDs.filter((id) => id !== null);

      let list = [];
      if (startDate && endDate) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate),
          new Date(endDate),
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      } else {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          startDate,
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        if (article.tags && typeof article.tags === "string") {
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate,
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${i + 1}`,
        });
      }

      const nextPage = Number(current_page) + 1;
      const previousPage = Number(current_page) - 1;
      res.render("writer/article-manage-published", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${nextPage}`,
        previousLink: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /DraftArticle-filter - Fetch filtered draft articles
router.get(
  "/DraftArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("tags")
      .optional()
      .isString()
      .trim()
      .withMessage("Tags must be a comma-separated string"),
    query("startCreateDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endCreateDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
    query("searchKeyWord")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Search keyword must not exceed 255 characters"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const tags = req.query.tags;
    const startDate = req.query.startCreateDate || null;
    const endDate = req.query.endCreateDate || null;
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    const rawSearchKeyWord = req.query.searchKeyWord || "";
    const searchKeyWord = decodeURIComponent(rawSearchKeyWord).split("?page=")[0].trim();
    const status = "draft";
    const user = await userService.getById(req.user.id);

    try {
      const limit = 5;
      let current_page = req.query.page || 1;
      const offset = (current_page - 1) * limit;

      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag);
          return tagData ? tagData.id : null;
        })
      );
      const validTagIDs = tagIDs.filter((id) => id !== null);

      let list = [];
      if (startDate && endDate) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate),
          new Date(endDate),
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      } else {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          startDate,
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        if (article.tags && typeof article.tags === "string") {
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate,
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${i + 1}`,
        });
      }

      const nextPage = Number(current_page) + 1;
      const previousPage = Number(current_page) - 1;
      res.render("writer/article-manage-draft", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${nextPage}`,
        previousLink: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /PendingArticle-filter - Fetch filtered pending articles
router.get(
  "/PendingArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("tags")
      .optional()
      .isString()
      .trim()
      .withMessage("Tags must be a comma-separated string"),
    query("startCreateDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endCreateDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
    query("searchKeyWord")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Search keyword must not exceed 255 characters"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const tags = req.query.tags;
    const startDate = req.query.startCreateDate || null;
    const endDate = req.query.endCreateDate || null;
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    const rawSearchKeyWord = req.query.searchKeyWord || "";
    const searchKeyWord = decodeURIComponent(rawSearchKeyWord).split("?page=")[0].trim();
    const status = "pending";
    const user = await userService.getById(req.user.id);

    try {
      const limit = 5;
      let current_page = req.query.page || 1;
      const offset = (current_page - 1) * limit;

      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag);
          return tagData ? tagData.id : null;
        })
      );
      const validTagIDs = tagIDs.filter((id) => id !== null);

      let list = [];
      if (startDate && endDate) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate),
          new Date(endDate),
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      } else {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          startDate,
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        if (article.tags && typeof article.tags === "string") {
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate,
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${i + 1}`,
        });
      }

      const nextPage = Number(current_page) + 1;
      const previousPage = Number(current_page) - 1;
      res.render("writer/article-manage-pending", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${nextPage}`,
        previousLink: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// GET /RejectedArticle-filter - Fetch filtered rejected articles
router.get(
  "/RejectedArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer")
      .toInt(),
    query("tags")
      .optional()
      .isString()
      .trim()
      .withMessage("Tags must be a comma-separated string"),
    query("startCreateDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),
    query("endCreateDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
    query("searchKeyWord")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Search keyword must not exceed 255 characters"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const tags = req.query.tags;
    const startDate = req.query.startCreateDate || null;
    const endDate = req.query.endCreateDate || null;
    const tagsArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    const rawSearchKeyWord = req.query.searchKeyWord || "";
    const searchKeyWord = decodeURIComponent(rawSearchKeyWord).split("?page=")[0].trim();
    const status = "rejected";
    const user = await userService.getById(req.user.id);

    try {
      const limit = 5;
      let current_page = req.query.page || 1;
      const offset = (current_page - 1) * limit;

      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag);
          return tagData ? tagData.id : null;
        })
      );
      const validTagIDs = tagIDs.filter((id) => id !== null);

      let list = [];
      if (startDate && endDate) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate),
          new Date(endDate),
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      } else {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          startDate,
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        if (article.tags && typeof article.tags === "string") {
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate,
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${i + 1}`,
        });
      }

      const nextPage = Number(current_page) + 1;
      const previousPage = Number(current_page) - 1;
      res.render("writer/article-manage-rejected", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${nextPage}`,
        previousLink: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(searchKeyWord)}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// POST /del - Delete an article
router.post(
  "/del",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  [
    body("id")
      .exists()
      .isString()
      .withMessage("Article ID must be a valid string"),
  ],
  handleValidationErrors,
  async function (req, res) {
    const id = req.body.id;
    try {
      await articleService.deleteById(id);
      await articleTagsService.deleteByArticleId(id);
      const refererUrl = req.get("Referer") || "/";
      res.redirect(refererUrl);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  }
);

export default router;