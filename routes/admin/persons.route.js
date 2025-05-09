import express from 'express';
import { query, body, param, validationResult } from 'express-validator';
import personService from '../../services/admin/person-admin.service.js';

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

// GET /persons - Fetch persons by role with pagination
router.get(
  '/persons',
  [
    query('role')
      .optional()
      .isIn(['user', 'guest', 'subscriber', 'writer', 'editor', 'admin'])
      .withMessage('Role must be one of: user, guest, subscriber, writer, editor, admin'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
  ],
  handleValidationErrors,
  async function (req, res) {
    const role = req.query.role || 'user';
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 6;
    let filteredUsers;
    let totalCount;

    if (role === 'user') {
      let userpage = Math.floor(itemsPerPage / 2);
      const guestCount = await personService.getTotalUsersCount('guest');
      const subscriberCount = await personService.getTotalUsersCount('subscriber');

      if (userpage >= guestCount) {
        userpage = guestCount;
      }

      const guestUsers = await personService.getPersonsRole('guest', page, userpage);
      const subscriberUsers = await personService.getPersonsRole('subscriber', page, itemsPerPage - userpage);

      filteredUsers = [...guestUsers, ...subscriberUsers];
      totalCount = guestCount + subscriberCount;
    } else {
      filteredUsers = await personService.getPersonsRole(role, page, itemsPerPage);
      totalCount = await personService.getTotalUsersCount(role);
    }

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
          active: i === page,
        });
      } else if (pageNumbers[pageNumbers.length - 1].value !== '...') {
        pageNumbers.push({ isEllipsis: true });
      }
    }

    filteredUsers.forEach(user => {
      user.isUser = user.role === 'subscriber' || user.role === 'guest';
      user.isWriter = user.role === 'writer';
      user.isEditor = user.role === 'editor';
    });

    if (role === 'editor') {
      const categories = await personService.getAllCategories();
      for (const user of filteredUsers) {
        const category = await personService.getCategoryNameByEditor(user.id);
 amidst://localhost:3000/admin/persons?role=editor        user.category = category;
        user.categories = categories;
      }
    }

    let tableHeaders = [];
    if (role === 'user') {
      tableHeaders = ['Name', 'Email', 'Birthdate', 'Expired date', 'Role', 'Subscription expiry', 'Status', 'Action'];
    } else if (role === 'writer') {
      tableHeaders = ['Name', 'Pen name', 'Email', 'Birthdate', 'Role', 'Action'];
    } else if (role === 'editor') {
      tableHeaders = ['Name', 'Email', 'Birthdate', 'Assignment', 'Role', 'Action'];
    }

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
      hasNextPage: hasNextPage,
    });
  }
);

// POST /persons/extend - Extend a subscriber's subscription
router.post(
  '/persons/extend',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('Subscriber ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async function (req, res) {
    try {
      const { id } = req.body;
      const result = await personService.extendSubscription(id, 7);

      if (result) {
        res.redirect('/admin/persons');
      } else {
        res.status(404).json({ message: 'Subscriber not found or unable to extend.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while extending the subscription.' });
    }
  }
);

// POST /persons/assignment - Assign categories to an editor
router.post(
  '/persons/assignment',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('Editor ID must be a valid UUID'),
    body('categoryID')
      .optional()
      .isArray()
      .withMessage('Category IDs must be an array')
      .custom((value) => {
        if (value && value.some(id => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
          throw new Error('All category IDs must be valid UUIDs');
        }
        return true;
      }),
    body('name')
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name must be a non-empty string')
      .isLength({ max: 255 })
      .withMessage('Name must not exceed 255 characters'),
    body('email')
      .exists()
      .isEmail()
      .withMessage('Email must be a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    body('birthdate')
      .optional()
      .isISO8601()
      .withMessage('Birthdate must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async function (req, res) {
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
  }
);

// GET /persons/selected-categories/:id - Fetch selected categories for an editor
router.get(
  '/persons/selected-categories/:id',
  [
    param('id')
      .exists()
      .isUUID()
      .withMessage('Editor ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.params;
    try {
      const selectedCategories = await personService.getCategoryNameByEditor(id);
      res.json(selectedCategories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching selected categories' });
    }
  }
);

// POST /persons/add - Add a new user
router.post(
  '/persons/add',
  [
    body('name')
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name must be a non-empty string')
      .isLength({ max: 255 })
      .withMessage('Name must not exceed 255 characters'),
    body('pen_name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Pen name must not exceed 255 characters'),
    body('email')
      .exists()
      .isEmail()
      .withMessage('Email must be a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    body('password')
      .optional()
      .isString()
      .isLength({ min: 6, max: 255 })
      .withMessage('Password must be between 6 and 255 characters'),
    body('birthdate')
      .optional()
      .isISO8601()
      .withMessage('Birthdate must be a valid ISO 8601 date'),
    body('role')
      .exists()
      .isIn(['guest', 'subscriber', 'writer', 'editor', 'admin'])
      .withMessage('Role must be one of: guest, subscriber, writer, editor, admin'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { name, pen_name, email, password, birthdate, role } = req.body;

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
  }
);

// POST /persons/approve - Approve a user
router.post(
  '/persons/approve',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.body;
      await personService.approveUser(id);
      res.redirect('/admin/persons');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while approving the user.');
    }
  }
);

// POST /persons/writers/update - Update a writer
router.post(
  '/persons/writers/update',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('Writer ID must be a valid UUID'),
    body('name')
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name must be a non-empty string')
      .isLength({ max: 255 })
      .withMessage('Name must not exceed 255 characters'),
    body('pen_name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Pen name must not exceed 255 characters'),
    body('email')
      .exists()
      .isEmail()
      .withMessage('Email must be a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    body('birthdate')
      .optional()
      .isISO8601()
      .withMessage('Birthdate must be a valid ISO 8601 date'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedWriter = await personService.updateWriter(req.body);
      res.redirect('/admin/persons?role=writer');
    } catch (error) {
      res.status(500).json({ message: 'Failed to update writer', error: error.message });
    }
  }
);

// POST /persons/users/update - Update a user
router.post(
  '/persons/users/update',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    body('name')
      .exists()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name must be a non-empty string')
      .isLength({ max: 255 })
      .withMessage('Name must not exceed 255 characters'),
    body('email')
      .exists()
      .isEmail()
      .withMessage('Email must be a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must not exceed 255 characters'),
    body('birthdate')
      .optional()
      .isISO8601()
      .withMessage('Birthdate must be a valid ISO 8601 date'),
    body('role')
      .exists()
      .isIn(['guest', 'subscriber'])
      .withMessage('Role must be one of: guest, subscriber'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updatedUser = await personService.updateUser(req.body);
      res.redirect('/admin/persons');
    } catch (error) {
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  }
);

// POST /persons/del - Delete a user
router.post(
  '/persons/del',
  [
    body('id')
      .exists()
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
  ],
  handleValidationErrors,
  async (req, res) => {
    const { id } = req.body;

    try {
      const result = await personService.deleteUserById(id);
      res.redirect('/admin/persons');
    } catch (error) {
      console.error('Error deleting user:', error.message);
      res.status(500).json({ message: 'Failed to delete user.', error: error.message });
    }
  }
);

export default router;