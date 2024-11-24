import express from  'express'
// import productService from '../services/categories.service.js';

const jsonData = {
    "data": [
      {
        "id": 1,
        "ten": "John Doe",
        "thuoc": "Quản lý sản phẩm",
        "ngay_tao": "2023-10-01",
        "ngay_chinh_sua": "2023-11-01"
      },
      {
        "id": 2,
        "ten": "Jane Smith",
        "thuoc": "Quản lý nhân sự",
        "ngay_tao": "2023-09-20",
        "ngay_chinh_sua": "2023-10-20"
      },
      {
        "id": 3,
        "ten": "Michael Johnson",
        "thuoc": "Quản lý tài chính",
        "ngay_tao": "2023-07-15",
        "ngay_chinh_sua": "2023-08-10"
      },
      {
        "id": 4,
        "ten": "Sarah Lee",
        "thuoc": "Quản lý marketing",
        "ngay_tao": "2023-05-12",
        "ngay_chinh_sua": "2023-06-15"
      },
      {
        "id": 5,
        "ten": "David Brown",
        "thuoc": "Quản lý kho",
        "ngay_tao": "2023-04-05",
        "ngay_chinh_sua": "2023-05-22"
      }
    ]
  };

const router = express.Router();


router.get('/', function (req, res) {
  res.render('admin/categories', { layout: 'admin', title: 'Chuyên mục' ,data: jsonData.data});
});

router.get('/del', (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing id parameter');
  }
  // delete 
  const categoryIndex = jsonData.data.findIndex(category => category.id === parseInt(id));
  
  if (categoryIndex === -1) {
    return res.status(404).send('Category not found');
  }

  jsonData.data.splice(categoryIndex, 1);
  // 

  res.redirect('/admin/categories');
});

router.get('/add', (req,res) => {
  res.redirect('/admin/categories');
});
router.get('/update', (req,res) => {
  res.redirect('/admin/categories');
});


export default router;