import expresss from "express";
import authControllers from "../controllers/auth.controllers";

const authRouter = expresss.Router();

authRouter.post("/register", authControllers.registerUser);
authRouter.post("/login", authControllers.loginUser);
authRouter.post("/refreshtoken",authControllers.refreshToken)
authRouter.post("/logout",authControllers.logoutUser)

export { authRouter };
