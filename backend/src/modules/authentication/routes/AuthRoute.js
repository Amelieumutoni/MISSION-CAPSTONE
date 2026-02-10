const AuthRouter = new require("express")();
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const createUploader = require("../../../utils/multer");
const upload = createUploader({ folder: "profiles" });
const authController = require("../controller/authController");
const adminRouter = require("./AdminRoute");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and auto-create profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 */
AuthRouter.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
AuthRouter.post("/login", authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get authenticated user and profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user data
 *       401:
 *         description: Unauthorized
 */
AuthRouter.get("/me", authGuard(), authController.me);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update profile (supports image upload)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Senior backend developer"
 *               location:
 *                 type: string
 *                 example: "Kigali, Rwanda"
 *               specialty:
 *                 type: string
 *                 example: "Node.js / PostgreSQL"
 *               years_experience:
 *                 type: integer
 *                 example: 5
 *               phone_contact:
 *                 type: string
 *                 example: "+250788000000"
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
AuthRouter.patch(
  "/profile",
  authGuard(),
  upload.single("profile_picture"),
  authController.updateProfile,
);

module.exports = AuthRouter;
