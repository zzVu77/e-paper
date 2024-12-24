import express from "express";
import userService from "../services/user.service.js";
import moment from "moment";
import bcrypt from "bcryptjs";

const router = express.Router();
function calculateRemainingMinutes(subscriptionExpiry) {
  if (!subscriptionExpiry) {
    return null; // Trả về null nếu không có giá trị
  }

  const now = new Date();
  const expiry = new Date(subscriptionExpiry);
  const diffMs = expiry - now;

  if (diffMs <= 0) {
    return 0; // Nếu đã hết hạn, trả về 0
  }

  return Math.floor(diffMs / (1000 * 60)); // Chuyển đổi từ ms sang phút
}
router.get("/myprofile", async function (req, res) {
  const user = await userService.getById(
    "f7d0f7cd-c1a1-11ef-be2d-0242ac120002"
  );
  const remainingMinutes = calculateRemainingMinutes(
    user[0].subscription_expiry
  );
  const formattedDate = moment(user[0].birthdate).format("YYYY-MM-DD"); // Chỉ lấy ngày, không có múi giờ

  let isReader =false;
  if (user[0].role == "subscriber" || user[0].role == "guest") {
    isReader = true;
  }
  console.log(isReader);
  res.render("account-setting-myprofile", {
    user: user[0],
    remainingMinutes,
    formattedDate,
    isReader
  });
  console.log(user);
});
router.post("/myprofile", async function (req, res) {
  // console.log(req.body);
  const userUpdate = req.body;
  await userService.patch(req.body.id, userUpdate);
  console.log(userUpdate);
  res.redirect("/account-setting/myprofile");
  // const user = await userService.getById(userUpdate.id);
  // const remainingMinutes = calculateRemainingMinutes(
  //   user[0].subscription_expiry
  // );
  // let isReader =false;
  // if (user.role =="subscriber" || user.role =="guest") {
  //   isReader = true;
  // }
  // res.render("account-setting-myprofile", {
  //   user: user[0],
  //   remainingMinutes: remainingMinutes,
  //   formattedDate: userUpdate.birthdate,
  //   isReader
  // });
});
router.post("/myprofile/subscription", async function (req, res) {
  // console.log(req.body);
  await userService.patch(req.body.id, {status: 'pending'});

  const user = await userService.getById(req.body.id);
  const remainingMinutes = calculateRemainingMinutes(
    user[0].subscription_expiry
  );
//   res.render("account-setting-myprofile", {
//     user: user[0],
//     remainingMinutes: remainingMinutes,
//     formattedDate: user.birthdate,
//   });
  res.redirect("/account-setting/myprofile");
});
router.get("/security", function (req, res) {
  res.render("account-setting-security", {
    showErrors: false,
    id: 1,
    isSent: false,
  });
});
router.post("/security", async function (req, res) {
  const user = await userService.getById(req.body.id);
  console.log(user);
  console.log(req.body);
  console.log(bcrypt.hashSync("password123", 8));
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

export default router;
