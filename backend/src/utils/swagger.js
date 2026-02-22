const swaggerJSDoc = require("swagger-jsdoc");
const dotenv = require("dotenv").config();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "CraftFolio API Documentation",
    version: "1.0.0",
    description:
      "Digital Documentation System for Rwandan Artisans. Handles Authentication, Profile Management, and Craft Archiving.",
    contact: {
      name: "CraftFolio Support",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
  },
};

module.exports = swaggerJSDoc({
  swaggerDefinition,
  apis: ["./src/modules/routes.js"],
});
