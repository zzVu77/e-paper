import express from "express";
import userService from '../services/user.service.js';

const router = express.Router();

router.get("/myprofile", async function (req, res) {
    const user = await userService.getById(1);
    res.render("account-setting-myprofile",{
        user: user[0],
    });
    console.log(user);
});
router.post("/myprofile", async function (req, res) {

});
router.get("/security", function (req, res) {
    res.render("account-setting-security");
});

export default router;