import express from "express";
import accountServices from "../services/account.service.js";
const router = express.Router();
router.get("/login", function (req, res) {
  res.render("login", { layout: "default" });
});

router.get("/signup", function (req, res) {
  res.render("signup", { layout: "default" });
});

router.post("/signup", async function (req, res) {
  try {
    const { username, password, fullname, email, birthday } = req.body;

    // In dữ liệu ra console để kiểm tra
    console.log("Received data:", {
      username,
      password,
      fullname,
      email,
      birthday,
    });

    // Gửi phản hồi về phía client
    res.status(200).json({
      message:
        "Sign up successful !\nThe email you registered will be used as your username and for receiving all notifications from us.",
      user: { username, fullname, email, birthday },
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
