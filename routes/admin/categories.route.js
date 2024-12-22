import express from  'express'
import categoryAdminService from '../../services/admin/category-admin.service.js';


const router = express.Router();


router.get('/', async function (req, res) {
  const currentPage = parseInt(req.query.page) || 1; 
  const itemsPerPage = 5; 
  const offset = (currentPage - 1) * itemsPerPage; 

  try {
    let data = await categoryAdminService.getPageCategories(itemsPerPage, offset);

    const totalCategories = await categoryAdminService.getTotalCategories();
    const totalItems = totalCategories.count;
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
    
    for (const category of data) {
      if (category.parent_id){
        const parentName = await categoryAdminService.getCategoryNameByParentId(category.parent_id);
        category.parent_name = parentName;
      }
    };
    const categories = await categoryAdminService.getAllCategories();
    data = data.map(category => ({
      ...category,
      categories: categories, 
    }));
    console.log(data);
    res.render('admin/categories', {
      layout: 'admin',
      title: 'Category', 
      data: data,
      pageNumbers: pageNumbers, 
      hasNextPage: currentPage < totalPages, 
      hasPrevPage: currentPage > 1, 
      nextPage: currentPage + 1, 
      prevPage: currentPage - 1, 
    });
  } catch (error) {
    console.error('Error rendering categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
});

router.post('/update',async (req,res) => {
  const { id, name_category, parent_category } = req.body;

  try {
    const result = await categoryAdminService.updateCategory(id, name_category, parent_category);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'An error occurred while updating the category' });
  }
});

router.post('/add', async (req, res) => {
  const { name, category } = req.body; 
  try {
      await categoryAdminService.addCategory(name, category);
      res.redirect('/admin/categories');
  } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ message: 'An error occurred while adding the category' });
  }
});

router.post('/del', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).send('Missing id parameter');
  }
  const result = await categoryAdminService.deleteCategory(id);

  res.redirect('/admin/categories');
});


export default router;