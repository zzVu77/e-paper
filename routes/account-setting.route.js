import { body, validationResult } from "express-validator";
import express from "express";
import userService from "../services/user.service.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import authMiddleware from "../auth/middlewares/authMiddleware.js";
import accountService from "../services/account.service.js";

const router = express.Router();

function calculateRemainingMinutes(subscriptionExpiry) {
  if (!subscriptionExpiry) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(subscriptionExpiry);
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / (1000 * 60)); // Chuyển đổi từ ms sang phút
}

router.get("/myprofile", authMiddleware.ensureAuthenticated, async function (req, res) {
  const user = await userService.getById(req.user.id);
  const remainingMinutes = calculateRemainingMinutes(user.subscription_expiry);
  let formattedDate = null;
  if (user[0].birthdate) {
    formattedDate = moment(user[0].birthdate).format("YYYY-MM-DD");
  }

  let isReader = false;
  if (user[0].role == "subscriber" || user[0].role == "guest") {
    isReader = true;
  }
  res.render("account-setting-myprofile", {
    user: user[0],
    remainingMinutes,
    formattedDate,
    isReader,
  });
});

router.post("/myprofile", [
  body('id').isUUID().withMessage('ID phải là UUID hợp lệ'),
  body('name').isLength({ min: 1 }).withMessage('Tên không được để trống'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('birthdate').optional().isDate().withMessage('Ngày sinh không hợp lệ'),
  body('role').isIn(['guest', 'subscriber', 'writer', 'editor', 'admin']).withMessage('Role không hợp lệ'),
], async function (req, res) {
  // Kiểm tra kết quả xác thực
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Tạo object mới chỉ chứa các trường cần thiết
  const { _csrf, ...userUpdate } = req.body; // Loại bỏ _csrf token
  
  await userService.patch(req.body.id, userUpdate);
  res.redirect("/account-setting/myprofile");
});

router.post("/myprofile/subscription", [
  body('id').isUUID().withMessage('ID phải là UUID hợp lệ')
], async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  await userService.patch(req.body.id, { status: "pending" });

  const user = await userService.getById(req.body.id);
  const remainingMinutes = calculateRemainingMinutes(user[0].subscription_expiry);
  res.redirect("/account-setting/myprofile");
});

router.get("/security", authMiddleware.ensureAuthenticated, async function (req, res) {
  const user = await userService.getById(req.user.id);
  res.render("account-setting-security", {
    showErrors: false,
    user: user[0],
    isSent: false,
  });
});

router.post("/security", [
  body('current_password').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
], async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account-setting-security", {
      showErrors: true,
      id: req.body.id,
      isSent: false,
    });
  }

  const user = await userService.getById(req.body.id);

  if (!bcrypt.compareSync(req.body.current_password, user[0].password)) {
    return res.render("account-setting-security", {
      showErrors: true,
      id: req.body.id,
      isSent: true,
    });
  }

  const update = {
    password: bcrypt.hashSync(req.body.new_password, 8),
  };
  await userService.patch(req.body.id, update);
  res.render("account-setting-security", {
    showErrors: false,
    id: req.body.id,
    isSent: true,
  });
});

router.post("/security/createPassword", [
  body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
], async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await userService.getById(req.body.id);
  const update = {
    password: bcrypt.hashSync(req.body.new_password, 8),
  };
  await userService.patch(req.body.id, update);
  res.redirect("/account-setting/security");
});

export default router;
