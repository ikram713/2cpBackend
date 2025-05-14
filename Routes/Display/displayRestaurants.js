
const express = require('express');
const router = express.Router();
const restaurants = require('../../Schema/RestaurantSchema.js');

router.get('/restaurants', async (req, res) => {
    try {
        const data = await restaurants.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ message: 'Failed to fetch restaurants.' });
    }
});

module.exports = router;

/**
 * @swagger
 * /restaurants:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all restaurants
 *     description: Returns a list of restaurants with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "La Bella Italia"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/restaurant-image.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Mon-Sun: 11:00 AM - 10:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch restaurants data"
 */