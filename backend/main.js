require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const sequelize = require("./src/utils/database/connection");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/utils/swagger");
const MainRouter = require("./src/modules/routes");

const db = require("./src/modules");
const GlobalErrorHandler = require("./src/utils/GlobalErrorHandler");

// used middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(GlobalErrorHandler);

// main api endpoints for the system
app.use("/api", MainRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/store", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Artisan Documentation System is Online");
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // await sequelize.sync({ alter: true });
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
