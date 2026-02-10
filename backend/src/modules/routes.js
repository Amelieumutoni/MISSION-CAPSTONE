const express = require("express");

const AuthRouter = require("../modules/authentication/routes/AuthRoute");
const adminRouter = require("../modules/authentication/routes/AdminRoute");
const ArtworksRouter = require("../modules/artwork/routes/ArtworksRoute");
const ArtRoute = require("../modules/authentication/routes/ArtRoute");

const app = express();

app.use("/auth", AuthRouter);
app.use("/artworks", ArtworksRouter);
app.use("/admin", adminRouter);

app.use("/", ArtRoute);

module.exports = app;
