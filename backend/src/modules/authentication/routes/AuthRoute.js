const AuthRouter = new require("express")();
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const authController = require("../controller/authController");

AuthRouter.get("/auth/login", authController.login);

AuthRouter.get("/auth/register", authController.register);

AuthRouter.get("/auth/me", authGuard(), authController.me);

module.exports = AuthRouter;
