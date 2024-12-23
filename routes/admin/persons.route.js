import express from  'express'
import personService from '../../services/admin/person-admin.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const role = req.query.role || 'subscriber'; 
  const page = parseInt(req.query.page) || 1; 
  const itemsPerPage = 5; 

  const filteredUsers = await personService.getPersonsRole(role, page, itemsPerPage);

  const totalCount = await personService.getTotalUsersCount(role);
  const totalPages = Math.ceil(totalCount / itemsPerPage); 

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : 1;
  const nextPage = hasNextPage ? page + 1 : totalPages;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
          pageNumbers.push({
              value: i,
              active: i === page
          });
      } else if (pageNumbers[pageNumbers.length - 1].value !== '...') {
          pageNumbers.push({ isEllipsis: true });
      }
  }

  filteredUsers.forEach(user => {
    user.isSubscriber = user.role === 'subscriber';
    user.isWriter = user.role === 'writer';
    user.isEditor = user.role === 'editor';
  });
  
  if (role === 'editor')
  {
    const categories = await personService.getAllCategories();
    for (const user of filteredUsers) {
      const category = await personService.getCategoryNameByEditor(user.id);
      console.log(category)
      user.category = category; 
      user.categories = categories; 
  }
  };
  console.log(filteredUsers);
  let tableHeaders = [];
  if (role === 'subscriber') {
      tableHeaders = ['Name', 'Email', 'Birthdate', 'Expired date', 'Role','Subscription expiry'];
  } else if (role === 'writer') {
      tableHeaders = ['Name', 'Pen name', 'Email', 'Birthdate', 'Role'];
  } else if (role === 'editor') {
      tableHeaders = ['Name', 'Email', 'Birthdate', 'Assignment', 'Role','Action'];
  }

  res.render('admin/persons', {
      layout: 'admin',
      title: 'Person',
      data: filteredUsers,
      headers: tableHeaders,
      catId: req.query.id,  
      pageNumbers: pageNumbers,
      prevPage: prevPage,
      nextPage: nextPage,
      hasPrevPage: hasPrevPage,
      hasNextPage: hasNextPage
  });
});

router.post('/extend', async function (req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Subscriber ID is required.' });
    }

    const result = await personService.extendSubscription(id, 7);

    // update later (middleware to save url previous)
    if (result) {
      res.redirect('/admin/persons');
    } else {
      res.status(404).json({ message: 'Subscriber not found or unable to extend.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while extending the subscription.' });
  }
});

router.post('/assignment', async function (req, res) {
  const { categoryID, id } = req.body; 
  const delAssignment = await personService.deleteAssignmentsByEditor(id);
  try {
    if (categoryID)
    {
      for (const catID of categoryID)
      {
        console.log(catID);
        const result = await personService.insertCategoryEditor(id, catID);
      }
    }
      res.redirect('/admin/persons?role=editor');
  } catch (error) {
      console.error('Error assigning/updating category for editor:', error);
      res.status(500).json({ message: 'An error occurred while processing the category assignment.' });
  }
});

router.get('/selected-categories/:id', async (req, res) => {
  const { id } = req.params;  
  console.log(id);
  try {
      const selectedCategories = await personService.getCategoryNameByEditor(id);
      console.log(selectedCategories);
      res.json(selectedCategories);  
  } catch (error) {
      res.status(500).json({ message: 'Error fetching selected categories' });
  }
});

export default router;