import express from "express";
import editorService from "../services/editor.service.js";

const router = express.Router();

router.get("/", async function (req, res) {
  const id_editor = req.user.id;
  
  const currentPage = parseInt(req.query.page) || 1; 
  const itemsPerPage = 5; 
  const offset = (currentPage - 1) * itemsPerPage;

  const status = req.query.status || null; // Get status filter from query parameter

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

router.post("/update", async (req, res) => {
  const { article_id, tag, categories, reason, decision, publish_date } = req.body; 
  const id_editor = req.user.id;
  try {
      await editorService.updateArticle(id_editor,article_id, tag, categories, reason, decision,publish_date);
      // update later (middleware to save url previous)
      res.redirect("/editor"); 
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).send("Something went wrong while updating the article.");
  }
});

export default router;
