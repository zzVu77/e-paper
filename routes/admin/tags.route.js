import express from  'express'

const dataJson = 
{
    "data": [
      {
        "id": 1,
        "ten_tag": "Tag A",
        "ngay_tao": "01/05/2023",
        "ngay_chinh_sua": "01/06/2023"
      },
      {
        "id": 2,
        "ten_tag": "Tag B",
        "ngay_tao": "10/06/2023",
        "ngay_chinh_sua": "20/06/2023"
      },
      {
        "id": 3,
        "ten_tag": "Tag C",
        "ngay_tao": "15/07/2023",
        "ngay_chinh_sua": "01/08/2023"
      },
      {
        "id": 4,
        "ten_tag": "Tag D",
        "ngay_tao": "10/04/2023",
        "ngay_chinh_sua": "10/05/2023"
      },
      {
        "id": 5,
        "ten_tag": "Tag E",
        "ngay_tao": "30/05/2023",
        "ngay_chinh_sua": "10/06/2023"
      }
    ]
  };
  

const router = express.Router();

router.get('/', function (req, res) {
  
    res.render('admin/tags', { layout: 'admin', title: 'Tags', data: dataJson.data });
  });

export default router;