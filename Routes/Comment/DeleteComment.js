
const express = require('express');
const router = express.Router();
const Comment = require('../../Schema/CommentSchema.js'); // Import the Comment model

// Route to delete a comment based on serviceName, userEmail, and comment text
router.delete('/deleteComment/:serviceName', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }
        const {serviceName } = req.params;
        const { comment: commentText } = req.body;
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

        // Delete the comment
        await Comment.deleteOne({ _id: comment._id });

        return res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

/**
 * @swagger
 * /deleteComment/{serviceName}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a user's comment on a service
 *     description: |
 *       Allows authenticated users to delete their own comments.
 *       Requires the service name, comment text, and user authentication via session cookie.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the service the comment belongs to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The exact text of the comment to be deleted
 *                 example: "This service was excellent!"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
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
 */