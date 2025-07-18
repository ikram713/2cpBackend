const express = require('express');
const router = express.Router();
const LocalUser = require("../../Schema/LocalUser");
const GoogleUser = require("../../Schema/GoogleUser");

router.get('/user-info', async (req, res) => {
    const { email } = req.session.otpUser || {};

    if (!email) {
    return res.status(401).json({ message: 'No session found' });
    }

    try {
    let user = await LocalUser.findOne({ email }).select('name email');

    if (!user) {
        user = await GoogleUser.findOne({ email }).select('name email');
    }

    if (!user) {
        return res.status(404).json({ message: ' This User not found' });
    }

    res.status(200).json({ name: user.name, email: user.email });

    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


/**
 * @swagger
 * /user-info:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get authenticated user's basic information
 *     description: >
 *       Returns the name and email of the currently authenticated user.
 *       Searches both LocalUser and GoogleUser collections.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       401:
 *         description: Unauthorized (no active session)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No session found"
 *       404:
 *         description: User not found in either database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

