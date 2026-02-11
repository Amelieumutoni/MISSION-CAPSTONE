// src/modules/routes.js (or wherever your MainRouter is)
const express = require("express");
const app = express();

const AuthRouter = require("../modules/authentication/routes/AuthRoute");
const ArtworksRouter = require("../modules/artwork/routes/ArtworksRoute");
const ExhibitionRoute = require("../modules/exhibition/routes/ExhibitionRoute"); // Import it here
const ArtRoute = require("../modules/authentication/routes/ArtRoute");

app.use("/auth", AuthRouter);
app.use("/artworks", ArtworksRouter);
app.use("/exhibitions", ExhibitionRoute);
app.use("/artists", ArtRoute);

module.exports = app;
