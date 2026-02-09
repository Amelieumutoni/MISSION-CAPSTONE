const AppError = require("../utils/ErrorHandler");
const multer = require("multer");

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpired = () =>
  new AppError("Token expired. Please log in again.", 401);

const handleSequelizeValidation = (err) =>
  new AppError(err.errors[0].message, 400);

const handleMulterError = (err) =>
  new AppError(err.message || "File upload failed", 400);

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // JWT errors
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpired();

  // Sequelize
  if (err.name === "SequelizeValidationError")
    error = handleSequelizeValidation(err);

  // Multer
  if (err instanceof multer.MulterError) error = handleMulterError(err);

  // Default
  if (!error.isOperational) {
    console.error("UNEXPECTED ERROR:", err);
    error = new AppError("Internal server error", 500);
  }

  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message,
  });
};
