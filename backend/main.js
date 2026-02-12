require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const sequelize = require("./src/utils/database/connection");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/utils/swagger");
const MainRouter = require("./src/modules/routes");
const WebhookRoute = require("./src/modules/commerce/routes/WebhookRoute");

const GlobalErrorHandler = require("./src/utils/GlobalErrorHandler");

// used middlewares
app.use(cors());
app.use("/api/webhooks", WebhookRoute);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(GlobalErrorHandler);

// main api endpoints for the system
app.use("/api", MainRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/store", express.static(path.join(__dirname, "uploads")));

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Craftfolio Documentation System is Online",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
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
