const AuthRouter = new require("express")();

AuthRouter.get("/auth/login", (req, res) => {
  res.send("Login page");
});

AuthRouter.get("/auth/register", (req, res) => {
  res.send("Login page");
});

AuthRouter.get("/auth/login", (req, res) => {
  res.send("Login page");
});

module.exports = AuthRouter;
