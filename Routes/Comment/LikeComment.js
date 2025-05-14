const express = require('express');
const router = express.Router();
const Comment = require('../../Schema/CommentSchema.js'); // Import the Comment model

// Route to like/unlike a comment
router.post('/likeComment', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }

        const { serviceName, comment: commentText } = req.body;
        const userEmail = req.user.email; // Get the user's email from the Passport session

        // Validate input
        if (!serviceName || !commentText) {
            return res.status(400).json({ message: "serviceName and comment are required" });
        }

        // Find the comment by serviceName, userEmail, and comment text
        const comment = await Comment.findOne({
            serviceName,
            userEmail,
            comment: commentText
        });

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user has already liked the comment
        const userIndex = comment.likes.indexOf(userEmail);

        if (userIndex === -1) {
            // User has not liked the comment yet, so add their email to the likes array
            comment.likes.push(userEmail);
        } else {
            // User has already liked the comment, so remove their email from the likes array
            comment.likes.splice(userIndex, 1);
        }

        // Save the updated comment
        await comment.save();

        return res.status(200).json({ 
            message: userIndex === -1 ? "Comment liked successfully" : "Comment unliked successfully",
            comment 
        });

    } catch (error) {
        console.error('Error liking/unliking comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

/**
 * @swagger
 * /likeComment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Like or unlike a comment
 *     description: |
 *       Allows authenticated users to toggle like status on a comment.
 *       If the user hasn't liked the comment, adds their like.
 *       If the user already liked the comment, removes their like.
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
 *               - comment
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: Name of the service the comment belongs to
 *                 example: "Delicious Restaurant"
 *               comment:
 *                 type: string
 *                 description: The exact text of the comment to like/unlike
 *                 example: "The food was amazing!"
 *     responses:
 *       200:
 *         description: Successfully liked/unliked comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment liked successfully"
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request - missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "serviceName and comment are required"
 *       401:
 *         description: Unauthorized - user not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User not logged in"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
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
 * 
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         serviceName:
 *           type: string
 *           example: "Delicious Restaurant"
 *         userEmail:
 *           type: string
 *           example: "user@example.com"
 *         comment:
 *           type: string
 *           example: "The food was amazing!"
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["user1@example.com", "user2@example.com"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-04-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-04-01T12:00:00Z"
 */