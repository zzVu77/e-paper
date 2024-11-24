import express from  'express'

const data = [
    {
      "id": 1,
      "author": "John Doe",
      "title": "Understanding JavaScript Closures",
      "category": "Programming",
      "tag": "JavaScript, Closures, Web Development",
      "status": "Draft"
    },
    {
      "id": 2,
      "author": "Jane Smith",
      "title": "Mastering CSS Grid Layouts",
      "category": "Design",
      "tag": "CSS, Layout, Responsive Design",
      "status": "Draft"
    },
    {
      "id": 3,
      "author": "Alice Johnson",
      "title": "Introduction to Machine Learning",
      "category": "AI & Machine Learning",
      "tag": "Machine Learning, Python, Data Science",
      "status": "Draft"
    },
    {
      "id": 4,
      "author": "Bob Brown",
      "title": "Building Scalable APIs with Node.js",
      "category": "Backend Development",
      "tag": "Node.js, API, Scalability",
      "status": "Draft"
    },
    {
      "id": 5,
      "author": "Charlie Lee",
      "title": "A Beginner's Guide to React",
      "category": "Frontend Development",
      "tag": "React, JavaScript, Frontend",
      "status": "Draft"
    }
  ];

const router = express.Router();

router.get('/', function (req, res) {
    res.render('editor', { layout: 'admin', title: 'Editor' ,data: data });
});

export default router;