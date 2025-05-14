const express = require('express');
const router = express.Router();
const SearchHistory = require('../../Schema/SearchHistoryGlobal.js');


router.get('/display-search', async (req, res) => {
    const email =req.user.email;

    if (!email) {
        return res.status(401).send({ error: "User not authenticated" });
    }
    try {
        // Find the user's search history
        const userHistories = await SearchHistory.find({ email });

        if (userHistories.length === 0) {
            return res.status(404).send({ message: "No search history found for this user." });
        }

        // Extract the search history from the first document (since userId is unique)
        const userHistory = userHistories[0];

        // Return the search history
        res.send({ searchHistory: userHistory.searches });
    } catch (error) {
        console.error('Error fetching search history:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

//Delete all serch history 
router.delete('/delete-search-history', async (req, res) => {
    // const userId = req.user.id; // Get the user ID from the session
    const email =req.user.email;

    if (!email) {
        return res.status(401).send({ error: "User not authenticated" });
    }

    try {
        // Delete the user's search history
        const result = await SearchHistory.deleteOne({ email });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "No search history found for this user." });
        }

        res.send({ message: "Search history deleted successfully." });
    } catch (error) {
        console.error('Error deleting search history:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
module.exports=router;

/**
 * @swagger
 * tags:
 *   name: Search History
 *   description: Endpoints for managing user search history
 */

/**
 * @swagger
 * /display-search:
 *   get:
 *     summary: Get user's search history
 *     tags: [Search History]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's search history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 searchHistory:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of previous searches
 *                   example: ["restaurant", "coffee shop", "medical"]
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: No search history found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No search history found for this user."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /delete-search-history:
 *   delete:
 *     summary: Delete user's search history
 *     tags: [Search History]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Search history deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Search history deleted successfully."
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: No search history found to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No search history found for this user."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
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