require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

require("./src/jobs/liveEventChecker");

const sequelize = require("./src/utils/database/connection");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/utils/swagger");
const MainRouter = require("./src/modules/routes");
const WebhookRoute = require("./src/modules/commerce/routes/WebhookRoute");
const GlobalErrorHandler = require("./src/utils/GlobalErrorHandler");

// Import your socket logic
const setupExhibitionSockets = require("./src/modules/exhibition/sockets/exhibitionSocket");
const {
  initNotificationModule,
} = require("./src/modules/notifications/events/notificationEvents");

// used middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api/webhooks", WebhookRoute);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// main api endpoints for the system
app.use("/api", MainRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/store", express.static(path.join(__dirname, "uploads")));

// Global Error Handler should be near the bottom

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
  console.log(req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});
app.use(GlobalErrorHandler);

async function bootstrap() {
  try {
    await sequelize.authenticate();
    sequelize.sync({ alter: true });

    const server = http.createServer(app);

    // 2. Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    setupExhibitionSockets(io);
    initNotificationModule(io);

    server.listen(port, () => {
      console.log(`Server & Sockets running on http://localhost:${port}`);
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
