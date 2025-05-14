
const express = require('express');
const router = express.Router();
const groceries = require('../../Schema/administrationSchema.js');


router.get('/groceries', async (req, res) => {
    try {
        const data = await groceries.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching groceries:', err);
        res.status(500).json({ message: 'Failed to fetch groceries.' });
    }
});


module.exports = router;

/**
 * @swagger
 * /groceries:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all grocery stores
 *     description: Returns a list of grocery stores with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved grocery stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "Fresh Market"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/grocery-store.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Mon-Sun: 7:00 AM - 10:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch grocery stores data"
 */