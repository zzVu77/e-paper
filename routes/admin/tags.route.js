import express from "express";
import tagAdminService from '../../services/tag-admin.service.js';



const router = express.Router();

router.get('/', async function (req, res) {
    const currentPage = parseInt(req.query.page) || 1; 
    const itemsPerPage = 5; 
    const offset = (currentPage - 1) * itemsPerPage; 

    try {
      let data = await tagAdminService.getPageTags(itemsPerPage, offset);

      const totalTags = await tagAdminService.getTotalTags();
      const totalItems = totalTags.count;
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
      console.log(data);
      res.render("admin/tags", {
        layout: "admin",
        title: "Tags",
        data: data, 
        pageNumbers: pageNumbers, 
        hasNextPage: currentPage < totalPages, 
        hasPrevPage: currentPage > 1, 
        nextPage: currentPage + 1, 
        prevPage: currentPage - 1, 
      });
    } catch (error) {
      console.error("Error rendering tags:", error);
      res.status(500).json({ message: 'An error occurred while fetching tags.' });
    }
  });
  
router.post('/update',async (req,res) => {
  const {id, name } = req.body;

  try {
    const result = await tagAdminService.updateTag(id,name);
    res.redirect('/admin/tags');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'An error occurred while updating the category' });
  }
});
router.post('/add', async (req, res) => {
  const { name } = req.body;
  
  try {
      const result = await tagAdminService.addTag(name); 
      res.redirect('/admin/tags'); 
  } catch (error) {
      console.error('Error adding tag:', error);
      res.status(500).json({ message: 'An error occurred while adding the tag' });
  }
});

router.post('/del', async (req, res) => {
  const { id } = req.body;
  try {
      const result = await tagAdminService.deleteTag(id); 
      res.redirect('/admin/tags'); 
  } catch (error) {
      console.error('Error adding tag:', error);
      res.status(500).json({ message: 'An error occurred while adding the tag' });
  }
});
export default router;