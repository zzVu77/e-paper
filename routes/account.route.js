import express from "express";
import accountServices from "../services/account.service.js";
import bcrypt from "bcryptjs";
import moment from "moment";

const router = express.Router();
router.get("/login", function (req, res) {
  res.render("login", { layout: "default" });
});

router.get("/signup", function (req, res) {
  res.render("signup", { layout: "default" });
});

router.post("/signup", async function (req, res) {
  try {
    const { password, fullname, email, birthday } = req.body;
    console.log("req.body", req.body);
    const hashPassword = bcrypt.hashSync(password, 8);
    const dob = moment(birthday, "YYYY-MM-DD").format("YYYY-MM-DD"); // Đảm bảo phù hợp kiểu DATE
    const subscription_expiry = moment()
      .add(7, "days")
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); // Chỉnh định dạng cho DATETIME
    console.log("", subscription_expiry);
    const result = await accountServices.addUser(
      fullname,
      email,
      dob,
      hashPassword,
      "subscriber",
      subscription_expiry
    );
    // Gửi phản hồi về phía client
    res.status(200).json({
      message:
        "Sign up successful !\nThe email you registered will be used as your username and for receiving all notifications from us.",
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error handling sign up:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/is-available", async function (req, res) {
  try {
    const email = req.query.email;

    // Kiểm tra username đã tồn tại chưa
    const isAvailable = await accountServices.getUserByEmail(email);
    // Gửi kết quả về client
    if (!isAvailable) {
      res.json(true);
    } else {
      res.json(false);
    }
  } catch (error) {
    console.error("Error checking username availability:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});
export default router;
