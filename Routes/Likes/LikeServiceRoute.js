const express = require('express');
const router = express.Router();
const LikedService = require('../../Schema/LikedServiceSchema.js');

router.post('/like-service', async (req, res) => {
    try {
        console.log("Session Data:", req.session); // Debug session
        console.log("User in session:", req.user); // Passport stores user in req.user
        // 🔹 Ensure user is logged in using Passport.js
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }

        const email = req.user.email; // Get email from Passport session
        const { serviceName, serviceType}=req.body;

        if (!serviceName || !serviceType) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        // Check if the service is already liked
        const existingLike = await LikedService.findOne({ email, serviceName});

        if (existingLike) {
            // If already liked, remove it (unlike)
            await LikedService.deleteOne({ email, serviceName });
            return res.json({ liked: false, message: 'Service unliked' });
        } else {
            // If not liked, add to liked services
            const newLike = new LikedService({ email, serviceName, serviceType});
            await newLike.save();
            console.log("Service liked");
            return res.json({ liked: true, message: 'Service liked Successfully' });
        }
    } catch (error) {
        console.error('Error liking/unliking service:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
        
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Service Likes
 *   description: Endpoints for managing liked services
 */

/**
 * @swagger
 * /like-service:
 *   post:
 *     summary: Like or unlike a service
 *     tags: [Service Likes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - serviceType
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: Name of the service to like/unlike
 *                 example: "Starbucks"
 *               serviceType:
 *                 type: string
 *                 description: Type of the service
 *                 example: "coffeeShop"
 *     responses:
 *       200:
 *         description: Successfully liked/unliked service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: Current like status after operation
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Service liked"
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required query parameters"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User not logged in"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie for authentication
 */