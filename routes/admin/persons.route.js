import express from  'express'
import personService from '../../services/admin/person-admin.service.js';

const router = express.Router();

router.get('/persons', async function (req, res) {
  const role = req.query.role || 'user'; 
  const page = parseInt(req.query.page) || 1; 
  const itemsPerPage = 6; // Total items per page
  let filteredUsers; 
  let totalCount;

  // Fetch users based on role and handle pagination
  if (role === "user") {
    let userpage = Math.floor(itemsPerPage / 2); 
    
    const guestCount = await personService.getTotalUsersCount('guest');
    const subscriberCount = await personService.getTotalUsersCount('subscriber');

    if (userpage >= guestCount)
    {
      userpage = guestCount;
    }

    const guestUsers = await personService.getPersonsRole('guest', page, userpage);
    const subscriberUsers = await personService.getPersonsRole('subscriber', page, itemsPerPage - userpage);

    filteredUsers = [...guestUsers, ...subscriberUsers];
    totalCount = guestCount + subscriberCount;

  } else {
    filteredUsers = await personService.getPersonsRole(role, page, itemsPerPage);

    // Get the total count for the specific role
    totalCount = await personService.getTotalUsersCount(role);
  }

  // Calculate total pages and ensure that no page exceeds the total count
  const totalPages = Math.ceil(totalCount / itemsPerPage); 

  // Pagination logic
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : 1;
  const nextPage = hasNextPage ? page + 1 : totalPages;

  // Generate page numbers for pagination
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

  // Add custom properties to users
  filteredUsers.forEach(user => {
    user.isUser = user.role === 'subscriber' || user.role === 'guest';
    user.isWriter = user.role === 'writer';
    user.isEditor = user.role === 'editor';
  });

  // If role is 'editor', add category data
  if (role === 'editor') {
    const categories = await personService.getAllCategories();
    for (const user of filteredUsers) {
      const category = await personService.getCategoryNameByEditor(user.id);
      user.category = category; 
      user.categories = categories; 
    }
  }

  // Define table headers based on the role
  let tableHeaders = [];
  if (role === 'user') {
    tableHeaders = ['Name', 'Email', 'Birthdate', 'Expired date', 'Role', 'Subscription expiry', 'Status', 'Action'];
  } else if (role === 'writer') {
    tableHeaders = ['Name', 'Pen name', 'Email', 'Birthdate', 'Role', 'Action'];
  } else if (role === 'editor') {
    tableHeaders = ['Name', 'Email', 'Birthdate', 'Assignment', 'Role', 'Action'];
  }


  // Render the view with the necessary data
  res.render('admin/persons', {
    layout: 'admin',
    title: 'Person',
    data: filteredUsers,
    headers: tableHeaders,
    catId: req.query.id,  
    role: role,
    pageNumbers: pageNumbers,
    prevPage: prevPage,
    nextPage: nextPage,
    hasPrevPage: hasPrevPage,
    hasNextPage: hasNextPage
  });
});


router.post('/persons/extend', async function (req, res) {
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

router.post('/persons/assignment', async function (req, res) {
  const { categoryID, id, name, email, birthdate } = req.body;

  try {
      await personService.deleteAssignmentsByEditor(id);

      await personService.updateEditorInfo(id, { name, email, birthdate });

      if (categoryID) {
          for (const catID of categoryID) {
              const isAssignedToOther = await personService.isCategoryAssignedToOther(catID, id);

              if (isAssignedToOther) {
                  return res.status(400).json({
                      message: `Category ID ${catID} is already assigned to another editor.`,
                  });
              }

              await personService.insertCategoryEditor(id, catID);
          }
      }

      res.redirect('/admin/persons?role=editor');
  } catch (error) {
      console.error('Error assigning/updating category for editor:', error);
      res.status(500).json({ message: error.message || 'An error occurred while processing the category assignment.' });
  }
});


router.get('/persons/selected-categories/:id', async (req, res) => {
  const { id } = req.params;  
  try {
      const selectedCategories = await personService.getCategoryNameByEditor(id);
      res.json(selectedCategories);  
  } catch (error) {
      res.status(500).json({ message: 'Error fetching selected categories' });
  }
});


router.post('/persons/add', async (req, res) => {
  const { name, pen_name, email, password, birthdate, role } = req.body;
  console.log(password);

  try {
    const result = await personService.addUser({ name, pen_name, email, password, birthdate, role });
    
    if (result.success) {
      res.redirect('/admin/persons');
    } else {
      res.status(500).send('Error adding the user');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Internal server error');
  }
});

router.post('/persons/approve', async (req, res) => {
  try {
      const { id } = req.body; 
      await personService.approveUser(id);  
      res.redirect('/admin/persons');  
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while approving the user.');
  }
});


// Route to update writer
router.post('/persons/writers/update', async (req, res) => {
  try {
      const updatedWriter = await personService.updateWriter(req.body);
      res.redirect('/admin/persons?role=writer');  
  } catch (error) {
      res.status(500).json({ message: 'Failed to update writer', error: error.message });
  }
});

router.post('/persons/users/update', async (req, res) => {
  try {
      const updatedUser = await personService.updateUser(req.body);
      res.redirect('/admin/persons');  
  } catch (error) {
      res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});


router.post('/persons/del', async (req, res) => {
  const { id } = req.body;

  try {
    const result = await personService.deleteUserById(id);

    res.redirect('/admin/persons');
  } catch (error) {
    console.error('Error deleting user:', error.message);

    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});
export default router;