import express from  'express'
// import productService from '../services/categories.service.js';
const users = [
  {
    id: "d2e30b6f-dc3c-4f7e-b33e-18d1fdd79b99",
    name: "John Doe",
    pen_name: "J.D.",
    email: "johndoe@example.com",
    password: "hashedpassword123", 
    birthdate: "1985-06-15",
    role: "writer", 
    subscription_expiry: null, // No expiry
    created_at: "2023-01-15",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-22"   // Changed to yyyy-mm-dd format
  },
  {
    id: "a72b3c2d-bf7a-43b9-bb89-5c7fca1a98be",
    name: "Jane Smith",
    pen_name: "J.S.",
    email: "janesmith@example.com",
    password: "hashedpassword456",
    birthdate: "1990-09-25",
    role: "editor",
    subscription_expiry: null, 
    created_at: "2023-06-10",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-20"   // Changed to yyyy-mm-dd format
  },
  {
    id: "b11f9a12-4628-4681-9f66-9ad5d2401c6a",
    name: "Alice Brown",
    pen_name: "A.B.",
    email: "alicebrown@example.com",
    password: "hashedpassword789",
    birthdate: "1992-03-18",
    role: "subscriber",
    subscription_expiry: "2025-03-18",  // Changed to yyyy-mm-dd format
    created_at: "2022-11-01",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-21"   // Changed to yyyy-mm-dd format
  },
  {
    id: "c08c345b-5a63-4b96-94e2-5d4a1a4f93f7",
    name: "Bob Green",
    pen_name: "B.G.",
    email: "bobgreen@example.com",
    password: "hashedpassword012",
    birthdate: "1987-12-05",
    role: "admin",
    subscription_expiry: null,
    created_at: "2021-07-15",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-19"   // Changed to yyyy-mm-dd format
  },
  {
    id: "e83bcfba-d282-47e9-b875-90c879ea7fd6",
    name: "David Harris",
    pen_name: "D.H.",
    email: "davidharris@example.com",
    password: "hashedpassword567",
    birthdate: "1983-08-25",
    role: "subscriber",
    subscription_expiry: "2025-01-01",  // Changed to yyyy-mm-dd format
    created_at: "2020-04-10",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-10"   // Changed to yyyy-mm-dd format
  },
  {
    id: "0d1a6bfb-bde7-4675-a2d2-dfe9a349ea65",
    name: "Eve Adams",
    pen_name: "E.A.",
    email: "eveadams@example.com",
    password: "hashedpassword890",
    birthdate: "2000-01-05",
    role: "writer",
    subscription_expiry: "2024-07-15",  // Changed to yyyy-mm-dd format
    created_at: "2022-02-22",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-18"   // Changed to yyyy-mm-dd format
  },
  {
    id: "ad651b44-b1a7-459f-8b59-6c19e3c6c3ea",
    name: "Frank Mitchell",
    pen_name: "F.M.",
    email: "frankmitchell@example.com",
    password: "hashedpassword987",
    birthdate: "1997-07-20",
    role: "editor",
    subscription_expiry: null,
    created_at: "2023-03-30",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-12"   // Changed to yyyy-mm-dd format
  },
  {
    id: "57fc5f25-86c4-4fa7-b775-c85d1b4e8596",
    name: "Grace Turner",
    pen_name: "G.T.",
    email: "graceturner@example.com",
    password: "hashedpassword654",
    birthdate: "1993-11-10",
    role: "admin",
    subscription_expiry: null,
    created_at: "2021-12-05",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-10"   // Changed to yyyy-mm-dd format
  },
  {
    id: "c2b5a440-48b5-4f3a-ae43-b12d6b442fd9",
    name: "Helen Lewis",
    pen_name: "H.L.",
    email: "helenlewis@example.com",
    password: "hashedpassword321",
    birthdate: "1994-12-02",
    role: "subscriber",
    subscription_expiry: "2024-12-15",  // Changed to yyyy-mm-dd format
    created_at: "2023-04-25",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-22"   // Changed to yyyy-mm-dd format
  },
  {
    id: "7b6fa5be-b215-4591-8d97-c8e74fa0707d",
    name: "Isaac Thompson",
    pen_name: "I.T.",
    email: "isaacthompson@example.com",
    password: "hashedpassword111",
    birthdate: "1989-04-12",
    role: "writer",
    subscription_expiry: "2024-06-30",  // Changed to yyyy-mm-dd format
    created_at: "2020-08-22",  // Changed to yyyy-mm-dd format
    updated_at: "2024-11-16"   // Changed to yyyy-mm-dd format
  }
];
const router = express.Router();

router.get('/', function (req, res) {
  const role = req.query.role || 'subscriber'; // Get role from URL parameter
  console.log(role);

  const filteredUsers = users.filter(user => user.role === role);

  // Add flags to each user object based on their role
  filteredUsers.forEach(user => {
    user.isSubscriber = user.role === 'subscriber';
    user.isWriter = user.role === 'writer';
    user.isEditor = user.role === 'editor';
  });

  let tableHeaders = [];
  if (role === 'subscriber') {
    tableHeaders = ['Tên', 'Email', 'Ngày sinh', 'Ngày hết hạn', 'Chức vụ'];
  } else if (role === 'writer') {
    tableHeaders = ['Tên', 'Bút danh', 'Email', 'Ngày sinh', 'Chức vụ'];
  } else if (role === 'editor') {
    tableHeaders = ['Tên', 'Email', 'Ngày sinh', 'Chuyên mục quản lý', 'Chức vụ'];
  }

  console.log(filteredUsers); // Check the data with flags

  res.render('admin/persons', {
    layout: 'admin',
    title: 'Người dùng',
    data: filteredUsers, // Now filteredUsers contains the flags
    headers: tableHeaders
  });
});



export default router;