const express = require('express');
const router = express.Router();
const Comment = require('../../Schema/CommentSchema.js'); // Import the Comment model

// Route to update a comment based on serviceName, userEmail, and original comment text
router.put('/updateComment/:serviceName', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }
        const {serviceName } = req.params;
        const { comment: originalComment, newComment } = req.body;
        const userEmail = req.user.email; // Get the user's email from the Passport session

        // Validate input
        if (!serviceName || !originalComment || !newComment) {
            return res.status(400).json({ message: "serviceName, original comment, and new comment are required" });
        }

        // Find the comment by serviceName, userEmail, and original comment text
        const comment = await Comment.findOne({
            serviceName,
            userEmail,
            comment: originalComment
        });

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Update the comment text
        comment.comment = newComment;
        await comment.save();

        return res.status(200).json({ message: "Comment updated successfully", updatedComment: comment });

    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

