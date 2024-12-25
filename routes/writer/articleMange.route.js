import express from "express";
import articleService from "../../services/article.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";
import authMiddleware from "../../auth/middlewares/authMiddleware.js";
import userService from "../../services/user.service.js";

const router = express.Router();
router.get(
  "/AllArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    // const list = await articleService.findAll();
    const limit = 5;
    let current_page = req.query.page || 1;
    if (isNaN(current_page) || current_page < 1) {
      // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
      current_page = 1; // Gán giá trị mặc định là 1
    }
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
    // Lặp qua từng bài viết trong list
    for (let article of list) {
      // Kiểm tra nếu tags có tồn tại và là một chuỗi
      if (article.tags && typeof article.tags === "string") {
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + Number(1);
    const previousPage = Number(current_page) - Number(1);
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
router.get(
  "/DraftArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    // const list = await articleService.findAll();
    const limit = 5;
    const status = "draft";
    let current_page = req.query.page || 1;
    if (isNaN(current_page) || current_page < 1) {
      // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
      current_page = 1; // Gán giá trị mặc định là 1
    }
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
    // Lặp qua từng bài viết trong list
    for (let article of list) {
      // Kiểm tra nếu tags có tồn tại và là một chuỗi
      if (article.tags && typeof article.tags === "string") {
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + Number(1);
    const previousPage = Number(current_page) - Number(1);
    res.render("writer/article-manage-draft", {
      list: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      isFirstPage: previousPage < 1,
      isLastPage: Number(current_page) === Number(nPages),
      nextLink: `/writer/article/manage/ApprovedArticle?page=${nextPage}`,
      previousLink: `/writer/article/manage/ApprovedArticle?page=${previousPage}`,
    });
  }
);
router.get(
  "/PublishedArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    // const list = await articleService.findAll();
    const limit = 5;
    const status = "published";
    let current_page = req.query.page || 1;
    if (isNaN(current_page) || current_page < 1) {
      // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
      current_page = 1; // Gán giá trị mặc định là 1
    }
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
    // Lặp qua từng bài viết trong list
    for (let article of list) {
      // Kiểm tra nếu tags có tồn tại và là một chuỗi
      if (article.tags && typeof article.tags === "string") {
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + Number(1);
    const previousPage = Number(current_page) - Number(1);
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
router.get(
  "/RejectedArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    // const list = await articleService.findAll();
    const limit = 5;
    const status = "rejected";
    let current_page = req.query.page || 1;
    if (isNaN(current_page) || current_page < 1) {
      // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
      current_page = 1; // Gán giá trị mặc định là 1
    }
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
    // Lặp qua từng bài viết trong list
    for (let article of list) {
      // Kiểm tra nếu tags có tồn tại và là một chuỗi
      if (article.tags && typeof article.tags === "string") {
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + Number(1);
    const previousPage = Number(current_page) - Number(1);
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
router.get(
  "/PendingArticle",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const user = await userService.getById(req.user.id);
    const limit = 5;
    const status = "pending";
    let current_page = req.query.page || 1;
    if (isNaN(current_page) || current_page < 1) {
      // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
      current_page = 1; // Gán giá trị mặc định là 1
    }
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
    // Lặp qua từng bài viết trong list
    for (let article of list) {
      // Kiểm tra nếu tags có tồn tại và là một chuỗi
      if (article.tags && typeof article.tags === "string") {
        // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
        article.tags = article.tags.split(",").map((tag) => tag.trim());
      }
    }

    const nextPage = Number(current_page) + Number(1);
    const previousPage = Number(current_page) - Number(1);
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
// Hàm kiểm tra tính hợp lệ của ngày
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // Kiểm tra nếu ngày hợp lệ
}
// Hàm tách searchKeyWord khỏi phần ?page nếu có
function extractSearchKeyWord(searchKeyWord) {
  // Giải mã searchKeyWord để xử lý các ký tự đặc biệt (như + -> khoảng trắng)
  searchKeyWord = decodeURIComponent(searchKeyWord);

  // Kiểm tra nếu searchKeyWord chứa '?page='
  if (searchKeyWord && searchKeyWord.includes("?page=")) {
    // Tách searchKeyWord khỏi tham số page
    const keyword = searchKeyWord.split("?page=")[0];
    return keyword.trim(); // Xóa khoảng trắng thừa
  }

  return searchKeyWord; // Nếu không có '?page=', trả về giá trị ban đầu
}

router.get(
  "/AllArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const tags = req.query.tags;
    // Xử lý startDate và endDate
    const startDate = isValidDate(req.query.startCreateDate)
      ? req.query.startCreateDate
      : null;
    const endDate = isValidDate(req.query.endCreateDate)
      ? req.query.endCreateDate
      : null;
    const tagsArray = tags ? tags.split(",") : [];
    const rawSearchKeyWord = req.query.searchKeyWord;
    const searchKeyWord = extractSearchKeyWord(rawSearchKeyWord);
    const status = "all";
    const user = await userService.getById(req.user.id);
    try {
      //pagnition
      const limit = 3;
      let current_page = req.query.page || 1;
      if (isNaN(current_page) || current_page < 1) {
        // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
        current_page = 1; // Gán giá trị mặc định là 1
      }
      const offset = (current_page - 1) * limit;

      // Lấy danh sách tagIDs tương ứng với các tags
      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
          return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
        })
      );

      // Loại bỏ các giá trị null (nếu có tags không tồn tại)
      const validTagIDs = tagIDs.filter((id) => id !== null);

      // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
      let list = [];
      if ((startDate != null) & (endDate != null)) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate), // Chuyển đổi sang đối tượng Date
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
          startDate, // Chuyển đổi sang đối tượng Date
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        // Kiểm tra nếu tags có tồn tại và là một chuỗi
        if (article.tags && typeof article.tags === "string") {
          // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate, // Chuyển đổi sang đối tượng Date
        endDate,
        searchKeyWord,
        user[0].id,
        status
      );
      const nPages = Math.ceil(nRows / limit);
      const pageNumbers = [];
      console.log(searchKeyWord);

      for (let i = 0; i < nPages; i++) {
        pageNumbers.push({
          value: i + 1,
          active: i + 1 === +current_page,
          link: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${encodeURIComponent(
            searchKeyWord
          )}&page=${i + 1}`,
        });
      }

      // console.log(list);
      // console.log(nRows);
      // console.log(pageNumbers);
      const nextPage = Number(current_page) + Number(1);
      const previousPage = Number(current_page) - Number(1);
      res.render("writer/article-manage-all", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${nextPage}`,
        previousLink: `/writer/article/manage/AllArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/PublishedArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const tags = req.query.tags;
    // Xử lý startDate và endDate
    const startDate = isValidDate(req.query.startCreateDate)
      ? req.query.startCreateDate
      : null;
    const endDate = isValidDate(req.query.endCreateDate)
      ? req.query.endCreateDate
      : null;
    const tagsArray = tags ? tags.split(",") : [];
    const rawSearchKeyWord = req.query.searchKeyWord;
    const searchKeyWord = extractSearchKeyWord(rawSearchKeyWord);
    const status = "published";
    const user = await userService.getById(req.user.id);

    try {
      //pagnition
      const limit = 5;
      let current_page = req.query.page || 1;
      if (isNaN(current_page) || current_page < 1) {
        // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
        current_page = 1; // Gán giá trị mặc định là 1
      }
      const offset = (current_page - 1) * limit;

      // Lấy danh sách tagIDs tương ứng với các tags
      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
          return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
        })
      );

      // Loại bỏ các giá trị null (nếu có tags không tồn tại)
      const validTagIDs = tagIDs.filter((id) => id !== null);

      // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
      let list = [];
      if ((startDate != null) & (endDate != null)) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate), // Chuyển đổi sang đối tượng Date
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
          startDate, // Chuyển đổi sang đối tượng Date
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        // Kiểm tra nếu tags có tồn tại và là một chuỗi
        if (article.tags && typeof article.tags === "string") {
          // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate, // Chuyển đổi sang đối tượng Date
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
          link: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${searchKeyWord}&page=${
            i + 1
          }`,
        });
      }

      // console.log(list);
      // console.log(pageNumbers);
      const nextPage = Number(current_page) + Number(1);
      const previousPage = Number(current_page) - Number(1);
      res.render("writer/article-manage-published", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${nextPage}`,
        previousLink: `/writer/article/manage/PublishedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/DraftArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const tags = req.query.tags;
    // Xử lý startDate và endDate
    const startDate = isValidDate(req.query.startCreateDate)
      ? req.query.startCreateDate
      : null;
    const endDate = isValidDate(req.query.endCreateDate)
      ? req.query.endCreateDate
      : null;
    const tagsArray = tags ? tags.split(",") : [];
    const rawSearchKeyWord = req.query.searchKeyWord;
    const searchKeyWord = extractSearchKeyWord(rawSearchKeyWord);
    const status = "draft";
    const user = await userService.getById(req.user.id);
    try {
      //pagnition
      const limit = 5;
      let current_page = req.query.page || 1;
      if (isNaN(current_page) || current_page < 1) {
        // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
        current_page = 1; // Gán giá trị mặc định là 1
      }
      const offset = (current_page - 1) * limit;

      // Lấy danh sách tagIDs tương ứng với các tags
      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
          return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
        })
      );

      // Loại bỏ các giá trị null (nếu có tags không tồn tại)
      const validTagIDs = tagIDs.filter((id) => id !== null);

      // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
      let list = [];
      if ((startDate != null) & (endDate != null)) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate), // Chuyển đổi sang đối tượng Date
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
          startDate, // Chuyển đổi sang đối tượng Date
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        // Kiểm tra nếu tags có tồn tại và là một chuỗi
        if (article.tags && typeof article.tags === "string") {
          // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate, // Chuyển đổi sang đối tượng Date
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
          link: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${searchKeyWord}&page=${
            i + 1
          }`,
        });
      }
      const nextPage = Number(current_page) + Number(1);
      const previousPage = Number(current_page) - Number(1);
      res.render("writer/article-manage-draft", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${nextPage}`,
        previousLink: `/writer/article/manage/DraftArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/PendingArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const tags = req.query.tags;
    // Xử lý startDate và endDate
    const startDate = isValidDate(req.query.startCreateDate)
      ? req.query.startCreateDate
      : null;
    const endDate = isValidDate(req.query.endCreateDate)
      ? req.query.endCreateDate
      : null;
    const tagsArray = tags ? tags.split(",") : [];
    const rawSearchKeyWord = req.query.searchKeyWord;
    const searchKeyWord = extractSearchKeyWord(rawSearchKeyWord);
    const status = "pending";
    const user = await userService.getById(req.user.id);

    try {
      //pagnition
      const limit = 5;
      let current_page = req.query.page || 1;
      if (isNaN(current_page) || current_page < 1) {
        // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
        current_page = 1; // Gán giá trị mặc định là 1
      }
      const offset = (current_page - 1) * limit;

      // Lấy danh sách tagIDs tương ứng với các tags
      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
          return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
        })
      );

      // Loại bỏ các giá trị null (nếu có tags không tồn tại)
      const validTagIDs = tagIDs.filter((id) => id !== null);

      // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
      let list = [];
      if ((startDate != null) & (endDate != null)) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate), // Chuyển đổi sang đối tượng Date
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
          startDate, // Chuyển đổi sang đối tượng Date
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      console.log(list);
      for (let article of list) {
        // Kiểm tra nếu tags có tồn tại và là một chuỗi
        if (article.tags && typeof article.tags === "string") {
          // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate, // Chuyển đổi sang đối tượng Date
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
          link: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${searchKeyWord}&page=${
            i + 1
          }`,
        });
      }

      // console.log(list);
      // console.log(pageNumbers);
      const nextPage = Number(current_page) + Number(1);
      const previousPage = Number(current_page) - Number(1);
      res.render("writer/article-manage-pending", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${nextPage}`,
        previousLink: `/writer/article/manage/PendingArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/RejectedArticle-filter",
  authMiddleware.ensureAuthenticated,
  authMiddleware.ensureWriter,
  async function (req, res) {
    const tags = req.query.tags;
    // Xử lý startDate và endDate
    const startDate = isValidDate(req.query.startCreateDate)
      ? req.query.startCreateDate
      : null;
    const endDate = isValidDate(req.query.endCreateDate)
      ? req.query.endCreateDate
      : null;
    const tagsArray = tags ? tags.split(",") : [];
    const rawSearchKeyWord = req.query.searchKeyWord;
    const searchKeyWord = extractSearchKeyWord(rawSearchKeyWord);
    const status = "rejected";
    const user = await userService.getById(req.user.id);
    try {
      //pagnition
      const limit = 5;
      let current_page = req.query.page || 1;
      if (isNaN(current_page) || current_page < 1) {
        // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
        current_page = 1; // Gán giá trị mặc định là 1
      }
      const offset = (current_page - 1) * limit;

      // Lấy danh sách tagIDs tương ứng với các tags
      const tagIDs = await Promise.all(
        tagsArray.map(async (tag) => {
          const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
          return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
        })
      );

      // Loại bỏ các giá trị null (nếu có tags không tồn tại)
      const validTagIDs = tagIDs.filter((id) => id !== null);

      // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
      let list = [];
      if ((startDate != null) & (endDate != null)) {
        list = await articleService.getArticlesByFilter(
          validTagIDs,
          new Date(startDate), // Chuyển đổi sang đối tượng Date
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
          startDate, // Chuyển đổi sang đối tượng Date
          endDate,
          searchKeyWord,
          limit,
          offset,
          user[0].id,
          status
        );
      }

      for (let article of list) {
        // Kiểm tra nếu tags có tồn tại và là một chuỗi
        if (article.tags && typeof article.tags === "string") {
          // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
          article.tags = article.tags.split(",").map((tag) => tag.trim());
        }
      }

      const nRows = await articleService.countArticlesByFilter(
        validTagIDs,
        startDate, // Chuyển đổi sang đối tượng Date
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
          link: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${tags}&searchKeyWord=${searchKeyWord}&page=${
            i + 1
          }`,
        });
      }

      // console.log(list);
      // console.log(pageNumbers);
      const nextPage = Number(current_page) + Number(1);
      const previousPage = Number(current_page) - Number(1);
      res.render("writer/article-manage-rejected", {
        list: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        isFirstPage: previousPage < 1,
        isLastPage: Number(current_page) === Number(nPages),
        pagnitionName: "AllArticle-filter",
        nextLink: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${nextPage}`,
        previousLink: `/writer/article/manage/RejectedArticle-filter?startCreateDate=${startDate}&endCreateDate=${endDate}&tags=${validTagIDs}&searchKeyWord=${searchKeyWord}&page=${previousPage}`,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post("/del",   authMiddleware.ensureWriter,  async function (req, res) {
  const id = req.body.id;
  // console.log("hell");
  // console.log(id);
  if (id != null) {
    await articleService.deleteById(id);
    await articleTagsService.deleteByArticleId(id);
  }
  const refererUrl = req.get("Referer") || "/"; // Mặc định về trang chủ nếu không có Referer
  res.redirect(refererUrl);
});
export default router;
