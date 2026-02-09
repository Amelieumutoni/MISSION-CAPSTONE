const swaggerJSDoc = require("swagger-jsdoc");

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
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Kezia Umutoni" },
          email: { type: "string", example: "kezia@artisan.rw" },
          password: { type: "string", example: "StrongPass123!" },
          role: {
            type: "string",
            enum: ["ADMIN", "AUTHOR", "BUYER"],
            example: "AUTHOR",
            description: "AUTHOR is for Artisans, BUYER is for general users",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "kezia@artisan.rw" },
          password: { type: "string", example: "StrongPass123!" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Login successful" },
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string" },
            },
          },
        },
      },
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          bio: {
            type: "string",
            example: "Master weaver specializing in Agaseke baskets.",
          },
          location: { type: "string", example: "Musanze, Northern Province" },
          specialty: { type: "string", example: "Basketry" },
          years_experience: { type: "integer", example: 12 },
          phone_contact: { type: "string", example: "+250780000000" },
        },
      },
      ProfilePictureUpload: {
        type: "object",
        properties: {
          image: {
            type: "string",
            format: "binary",
            description: "Profile image file (jpg, png, jpeg)",
          },
        },
      },
    },
  },
};

module.exports = swaggerJSDoc({
  swaggerDefinition,
  apis: ["./src/modules/**/routes/*.js"],
});
