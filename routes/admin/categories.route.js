import express from 'express';
import categoryAdminService from '../../services/admin/category-admin.service.js';
import { validate as isUUID } from 'uuid';

const router = express.Router();

function isValidCategoryName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 255;
}

function isValidUUID(id) {
  return typeof id === 'string' && isUUID(id);
}

// GET /admin/categories
router.get('/', async function (req, res) {
  let currentPage = parseInt(req.query.page);
  const itemsPerPage = 5;

  if (isNaN(currentPage) || currentPage < 1) {
    currentPage=1;
  }

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
      if (category.parent_id && isValidUUID(category.parent_id)) {
        const parentName = await categoryAdminService.getCategoryNameByParentId(category.parent_id);
        category.parent_name = parentName;
      }
    }

    const categories = await categoryAdminService.getAllCategories();
    data = data.map(category => ({
      ...category,
      categories: categories,
    }));

    console.log('refreshToken =', res.locals.csrfToken);

    res.render('admin/categories', {
      layout: 'admin',
      title: 'Category',
      data: data,
      pageNumbers,
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

// POST /admin/categories/update
router.post('/update', async (req, res) => {
  const { id, name_category, parent_category } = req.body;

  if (!isValidUUID(id) || !isValidCategoryName(name_category)) {
    return res.status(400).json({ message: 'Invalid category ID or name.' });
  }

  const parentId = parent_category || null;
  if (parentId && !isValidUUID(parentId)) {
    return res.status(400).json({ message: 'Invalid parent category ID.' });
  }

  try {
    await categoryAdminService.updateCategory(id, name_category, parentId);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'An error occurred while updating the category.' });
  }
});

// POST /admin/categories/add
router.post('/add', async (req, res) => {
  const { name, category } = req.body;

  if (!isValidCategoryName(name)) {
    return res.status(400).json({ message: 'Invalid category name.' });
  }

  const parentId = category || null;
  if (parentId && !isValidUUID(parentId)) {
    return res.status(400).json({ message: 'Invalid parent category ID.' });
  }

  try {
    await categoryAdminService.addCategory(name, parentId);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'An error occurred while adding the category.' });
  }
});

// POST /admin/categories/del
router.post('/del', async (req, res) => {
  const { id } = req.body;

  if (!isValidUUID(id)) {
    return res.status(400).json({ message: 'Invalid category ID.' });
  }

  try {
    await categoryAdminService.deleteCategory(id);
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'An error occurred while deleting the category.' });
  }
});

export default router;
