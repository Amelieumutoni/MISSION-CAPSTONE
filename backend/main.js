require("dotenv").config();
const express = require("express");
const app = express();
const sequelize = require("./src/utils/database/connection");
const AuthRouter = require("./src/modules/authentication/routes/AuthRoute");

const db = require("./src/modules");

app.use(express.json());
app.use("/api", AuthRouter);
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Artisan Documentation System is Online");
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync({ alter: true });
    console.log("Database models synced.");

    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

bootstrap();
