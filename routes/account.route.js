import express from "express";
import accountServices from "../services/account.service.js";
import bcrypt from "bcryptjs";
import moment from "moment";
import { body, query, validationResult } from "express-validator";

const router = express.Router();

router.get("/login", function (req, res) {
  res.render("login", { layout: "default" });
});

router.get("/signup", function (req, res) {
  res.render("signup", { layout: "default" });
});

router.post("/signup", [
  body("fullname")
    .notEmpty()
    .withMessage("Họ và tên không được để trống.")
    .isLength({ max: 100 })
    .withMessage("Họ và tên quá dài."),
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự."),
  body("birthday")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Ngày sinh không hợp lệ."),
], async function (req, res) {
  // Kiểm tra kết quả xác thực
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { password, fullname, email, birthday } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await accountServices.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "Email này đã được đăng ký. Vui lòng sử dụng email khác.",
      });
    }

    const hashPassword = bcrypt.hashSync(password, 8);
    const dob = moment(birthday, "YYYY-MM-DD").format("YYYY-MM-DD"); // Đảm bảo phù hợp kiểu DATE
    const subscription_expiry = moment()
      .add(7, "days")
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Chỉnh định dạng cho DATETIME

    await accountServices.addUser(
      fullname,
      email,
      dob,
      hashPassword,
      "guest",
      subscription_expiry
    );

    res.status(200).json({
      message:
        "Sign up successful! The email you registered will be used as your username and for receiving all notifications from us.",
    });
  } catch (error) {
    console.error("Error handling sign up:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/is-available", [
  query("email")
    .isEmail()
    .withMessage("Email không hợp lệ.")
    .normalizeEmail(),
], async function (req, res) {
  // Kiểm tra kết quả xác thực
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const email = req.query.email;

    const isAvailable = await accountServices.getUserByEmail(email);
    if (!isAvailable) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.error("Error checking email availability:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

export default router;
