import { Router } from "express";
import { check } from "express-validator";
import { postSignup, postSignin, getUser } from "../controllers/authController";

const router = Router();

router.post("/signup", [check("email").isEmail(), check("password").isLength({ min: 6 })], postSignup);
router.post("/signin", [check("email").isEmail(), check("password").exists()], postSignin);
router.get("/user/:userId", getUser);

export default router;
