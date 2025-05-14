const express = require('express');
const router = express.Router();
const LocalUser = require("../../Schema/LocalUser");

router.put('/edit-profile',async (req, res) => {
    try {

    const { name } = req.body;
    const email =req.session.otpUser.email;
    if (!email) {
    return res.status(401).send({ error: "User not authenticated" });
    } 
    const user = await LocalUser.findOne({email});
    if (name) {
    user.name = name;
    }


 // Save the updated user object
        await user.save();

 // Send a success response
    res.status(200).json({ message: 'Profile updated successfully', user });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
}
});

module.exports = router;

/**
 * @swagger
 * /edit-profile:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user profile information
 *     description: Authenticated users can update their profile details (currently supports name update)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: New name to update
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (user not authenticated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
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
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 */