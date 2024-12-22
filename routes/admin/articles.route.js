import express from "express";
import adminService from '../../services/admin/article-admin.service.js';

const router = express.Router();


router.get("/", async function (req, res) {
  const currentPage = parseInt(req.query.page) || 1; 
  const itemsPerPage = 4; 
  const offset = (currentPage - 1) * itemsPerPage; 

  let data = await adminService.getPageArticles(itemsPerPage, offset); 
  const categories = await adminService.getAllCategories();

  data = data.map(article => {
    let statusClass = '';

    if (article.article_status === 'published') {
      statusClass = 'tw-bg-green-400 tw-text-white tw-rounded-lg tw-text-center tw-text-base';
    } else if (article.article_status === 'draft') {
      statusClass = 'tw-bg-yellow-400 tw-text-white tw-rounded-lg tw-text-center tw-text-base';
    } else if (article.article_status === 'rejected') {
      statusClass = 'tw-bg-red-500 tw-text-white tw-rounded-lg tw-text-center tw-text-base';
    }

    return {
      ...article,
      categories: categories,
      statusClass, 
    };
  });
  console.log(data);
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
});

router.post("/update", async (req, res) => {
  const { article_id, tag, categories, reason, decision } = req.body; 
  const admin_id = '1';
  try {
      await adminService.updateArticle(admin_id,article_id, tag, categories, reason, decision);
      // update later (middleware to save url previous)
      res.redirect("/admin/articles"); 
  } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).send("Something went wrong while updating the article.");
  }
});

export default router;
