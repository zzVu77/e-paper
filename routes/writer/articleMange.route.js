import express from "express";
import articleService from "../../services/article.service.js";
import tagService from "../../services/tag.service.js";
import articleTagsService from "../../services/articleTag.service.js";

const router = express.Router();

router.get("/all", async function (req, res) {
  // const list = await articleService.findAll();
  const limit = 5;
  let current_page = req.query.page || 1;
  if (isNaN(current_page) || current_page < 1) {
    // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
    current_page = 1; // Gán giá trị mặc định là 1
  }
  const offset = (current_page - 1) * limit;

  const nRows = await articleService.countAllArticlesByAuthorID(1);
  const nPages = Math.ceil(nRows.total / limit);
  const pageNumbers = [];
  for (let i = 0; i < nPages; i++) {
    pageNumbers.push({
      value: i + 1,
      active: i + 1 === +current_page,
    });
  }

  const list = await articleService.findPageByAuthorID(limit, offset,1);
  // Lặp qua từng bài viết trong list
  for (let article of list) {
    // Kiểm tra nếu tags có tồn tại và là một chuỗi
    if (article.tags && typeof article.tags === "string") {
      // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
      article.tags = article.tags.split(",").map((tag) => tag.trim());
    }
  }
  // console.log(nRows)
  // console.log(nPages)
  console.log(list);
  // console.log(pageNumbers)
  res.render("article-manage-all", {
    list: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
    nextPage: Number(current_page) + Number(1),
    previousPage: Number(current_page) - Number(1),
    isLastPage: Number(current_page) === Number(nPages),
  });
});

router.get("/approved", async function (req, res) {
  // const list = await articleService.findAll();
  const limit = 5;
  let current_page = req.query.page || 1;
  if (isNaN(current_page) || current_page < 1) {
    // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
    current_page = 1; // Gán giá trị mặc định là 1
  }
  const offset = (current_page - 1) * limit;

  const nRows = await articleService.countAllArticlesByAuthorID(1);
  const nPages = Math.ceil(nRows.total / limit);
  const pageNumbers = [];
  for (let i = 0; i < nPages; i++) {
    pageNumbers.push({
      value: i + 1,
      active: i + 1 === +current_page,
    });
  }

  const list = await articleService.findPageByStatusAndAuthorID(limit, offset, "approved",1);
  // Lặp qua từng bài viết trong list
  for (let article of list) {
    // Kiểm tra nếu tags có tồn tại và là một chuỗi
    if (article.tags && typeof article.tags === "string") {
      // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
      article.tags = article.tags.split(",").map((tag) => tag.trim());
    }
  }
  // console.log(nRows)
  // console.log(nPages)
  console.log(list);
  // console.log(pageNumbers)
  res.render("article-manage-approved", {
    list: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
    nextPage: Number(current_page) + Number(1),
    previousPage: Number(current_page) - Number(1),
    isLastPage: Number(current_page) === Number(nPages),
  });
});

router.get("/published", async function (req, res) {
  // const list = await articleService.findAll();
  const limit = 5;
  let current_page = req.query.page || 1;
  if (isNaN(current_page) || current_page < 1) {
    // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
    current_page = 1; // Gán giá trị mặc định là 1
  }
  const offset = (current_page - 1) * limit;

  const nRows = await articleService.countAllArticlesByAuthorID(1);
  const nPages = Math.ceil(nRows.total / limit);
  const pageNumbers = [];
  for (let i = 0; i < nPages; i++) {
    pageNumbers.push({
      value: i + 1,
      active: i + 1 === +current_page,
    });
  }

  const list = await articleService.findPageByStatusAndAuthorID(
    limit,
    offset,
    "published",
    1
  );
  // Lặp qua từng bài viết trong list
  for (let article of list) {
    // Kiểm tra nếu tags có tồn tại và là một chuỗi
    if (article.tags && typeof article.tags === "string") {
      // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
      article.tags = article.tags.split(",").map((tag) => tag.trim());
    }
  }
  // console.log(nRows)
  // console.log(nPages)
  console.log(list);
  // console.log(pageNumbers)
  res.render("article-manage-published", {
    list: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
    nextPage: Number(current_page) + Number(1),
    previousPage: Number(current_page) - Number(1),
    isLastPage: Number(current_page) === Number(nPages),
  });
});

router.get("/rejected", async function (req, res) {
  // const list = await articleService.findAll();
  const limit = 5;
  let current_page = req.query.page || 1;
  if (isNaN(current_page) || current_page < 1) {
    // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
    current_page = 1; // Gán giá trị mặc định là 1
  }
  const offset = (current_page - 1) * limit;

  const nRows = await articleService.countAllArticlesByAuthorID(1);
  const nPages = Math.ceil(nRows.total / limit);
  const pageNumbers = [];
  for (let i = 0; i < nPages; i++) {
    pageNumbers.push({
      value: i + 1,
      active: i + 1 === +current_page,
    });
  }

  const list = await articleService.findPageByStatusAndAuthorID(limit, offset, "rejected",1);
  // Lặp qua từng bài viết trong list
  for (let article of list) {
    // Kiểm tra nếu tags có tồn tại và là một chuỗi
    if (article.tags && typeof article.tags === "string") {
      // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
      article.tags = article.tags.split(",").map((tag) => tag.trim());
    }
  }
  // console.log(nRows)
  // console.log(nPages)
  // console.log(list)
  // console.log(pageNumbers)
  res.render("article-manage-rejected", {
    list: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
    nextPage: Number(current_page) + Number(1),
    previousPage: Number(current_page) - Number(1),
    isLastPage: Number(current_page) === Number(nPages),
  });
});

router.get("/pending", async function (req, res) {
  // const list = await articleService.findAll();
  const limit = 5;
  let current_page = req.query.page || 1;
  if (isNaN(current_page) || current_page < 1) {
    // Nếu current_page không phải là một số hợp lệ hoặc nhỏ hơn 1
    current_page = 1; // Gán giá trị mặc định là 1
  }
  const offset = (current_page - 1) * limit;

  const nRows = await articleService.countAllArticlesByAuthorID(1);
  const nPages = Math.ceil(nRows.total / limit);
  const pageNumbers = [];
  for (let i = 0; i < nPages; i++) {
    pageNumbers.push({
      value: i + 1,
      active: i + 1 === +current_page,
    });
  }

  const list = await articleService.findPageByStatusAndAuthorID(limit, offset, "pending",1);
  // Lặp qua từng bài viết trong list
  for (let article of list) {
    // Kiểm tra nếu tags có tồn tại và là một chuỗi
    if (article.tags && typeof article.tags === "string") {
      // Tách chuỗi tags thành mảng, loại bỏ khoảng trắng thừa nếu có
      article.tags = article.tags.split(",").map((tag) => tag.trim());
    }
  }
  // console.log(nRows)
  // console.log(nPages)
  // console.log(list)
  // console.log(pageNumbers)
  res.render("article-manage-pending", {
    list: list,
    empty: list.length === 0,
    pageNumbers: pageNumbers,
    nextPage: Number(current_page) + Number(1),
    previousPage: Number(current_page) - Number(1),
    isLastPage: Number(current_page) === Number(nPages),
  });
});

// router.get("/filter", async function (req, res) {
//   const tags = req.query.tags;
//   const startFilterDate = req.query.startCreateDate;
//   const endFilterDate = req.query.endCreateDate;
//   const tagsArray = tags ? tags.split(",") : [];

//   try {
//     // Lấy danh sách tagIDs tương ứng với các tags
//     const tagIDs = await Promise.all(
//       tagsArray.map(async (tag) => {
//         const tagData = await tagService.getTagByName(tag.trim()); // Lấy tagID từ tên tag
//         return tagData ? tagData.id : null; // Trả về null nếu tag không tồn tại
//       })
//     );

//     // Loại bỏ các giá trị null (nếu có tags không tồn tại)
//     const validTagIDs = tagIDs.filter((id) => id !== null);

//     if (validTagIDs.length === 0) {
//       return res.json({ message: "No matching articles found", articles: [] });
//     }

//     // Kiểm tra khoảng thời gian
//     if (!startFilterDate || !endFilterDate) {
//       return res
//         .status(400)
//         .json({ message: "startCreateDate and endCreateDate are required" });
//     }

//     // Lấy danh sách bài viết dựa trên các tagIDs hợp lệ và khoảng thời gian
//     const articles = await articleService.getArticlesByFilter(
//       validTagIDs,
//       new Date(startFilterDate), // Chuyển đổi sang đối tượng Date
//       new Date(endFilterDate)
//     );
//     // console.log(new Date(startFilterDate));
//     // console.log(new Date(endFilterDate));
//     console.log(articles);

//     res.json({ message: "Success", articles });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.post("/del", async function (req, res) {
  const id = req.body.id;
  console.log("hell");
  console.log(id);
  if (id != null) {
    await articleService.deleteById(id);
    await articleTagsService.deleteByArticleId(id);
  }
  const refererUrl = req.get("Referer") || "/"; // Mặc định về trang chủ nếu không có Referer
  res.redirect(refererUrl);
});
export default router;