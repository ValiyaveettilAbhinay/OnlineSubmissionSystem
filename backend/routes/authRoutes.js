const exp = require("express");
const router = exp.Router();


const {loginUser,signinUser} = require("../controllers/authController");
router.post("/register",signinUser);
router.post("/login",loginUser);



module.exports = router;
