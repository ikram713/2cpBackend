const express = require("express");
const passport = require("passport");
const ensureAdmin = require("../../Config/ensureAdmin");
const AdminUser = require("../../Schema/AdminUser");

const router = express.Router(); // Initialize router


//Delete all users 
router.delete("/delete-all-admins", async (req, res) => {
    try {
        await AdminUser.deleteMany({});
        res.status(200).json({ message: "All admins deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

// ✅ Admin Login Route
// 
router.post("/login", async (req, res, next) => {
    passport.authenticate("admin-local", async (err, admin, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!admin) return res.status(401).json({ error: info.message });

        // 🔹 Check if user has admin role
        if (admin.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Not an admin." });
        }
        req.logIn(admin, (err) => {
            if (err) return res.status(500).json({ error: err.message });

            return res.json({ message: "Admin login successful", admin });
        });
    })(req, res, next);
});


// ✅ Admin Logout Route
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });

        req.session.destroy(() => {
            res.json({ message: "Admin logged out successfully" });
        });
    });
});

// 🔹 Admin Dashboard (Protected)
router.get("/dashboard", ensureAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!", admin: req.user });
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator authentication and management
 */

/**
 * @swagger
 * /delete-all-admins:
 *   delete:
 *     tags: [Admin]
 *     summary: "[SUPER ADMIN] Delete all admin accounts"
 *     description: Permanently deletes all admin accounts from the system
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All admins deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All admins deleted successfully!"
 *       401:
 *         description: Unauthorized (requires admin privileges)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Database error details"
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Admin]
 *     summary: Admin login
 *     description: Authenticate administrator with credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "AdminPassword123!"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin login successful"
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       403:
 *         description: Forbidden (not an admin account)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied. Not an admin."
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /logout:
 *   get:
 *     tags: [Admin]
 *     summary: Admin logout
 *     description: Terminates the current admin session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin logged out successfully"
 *       500:
 *         description: Logout error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Logout failed"
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Admin dashboard
 *     description: Protected admin dashboard endpoint
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome, Admin!"
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin privileges required)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@example.com"
 *         role:
 *           type: string
 *           enum: [admin, superadmin]
 *           example: "admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */