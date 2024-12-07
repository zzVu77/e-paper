import express from "express";
// import productService from '../services/categories.service.js';

const router = express.Router();

let data = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    title: "Lập trình web với React",
    category: "Công nghệ",
    tags: "React, JavaScript, Frontend",
    status: "Đã duyệt",
  },
  {
    id: 2,
    author: "Trần Thị B",
    title: "SEO cho website",
    category: "Marketing",
    tags: "SEO, Website, Google",
    status: "Nháp",
  },
  {
    id: 3,
    author: "Lê Minh C",
    title: "Node.js và các tính năng mới",
    category: "Công nghệ",
    tags: "Node.js, JavaScript, Backend",
    status: "Đã duyệt",
  },
  {
    id: 4,
    author: "Phạm Lan D",
    title: "Học thiết kế UI/UX",
    category: "Thiết kế",
    tags: "UI/UX, Design",
    status: "Nháp",
  },
  {
    id: 5,
    author: "Hồ Quang E",
    title: "Chuyển đổi dữ liệu với Python",
    category: "Công nghệ",
    tags: "Python, Data Science",
    status: "Đã duyệt",
  },
];
router.get("/", function (req, res) {
  data = data.map((item) => {
    item.buttonClass =
      item.status === "Đã duyệt" ? "tw-bg-amber-400" : "tw-bg-gray-400";
    return item;
  });
  res.render("admin/articles", {
    layout: "admin",
    title: "Articles",
    data: data,
  });
});

export default router;
