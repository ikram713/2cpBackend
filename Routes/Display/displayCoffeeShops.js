
const express = require('express');
const router = express.Router();
const coffeeShops = require('../../Schema/CoffeeShopSchema.js');

router.get('/coffeeShops', async (req, res) => {
    try {
        const data = await coffeeShops.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching coffeeShops:', err);
        res.status(500).json({ message: 'Failed to fetch coffeeShops.' });
    }
});

module.exports = router;

/**
 * @swagger
 * /coffeeShops:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all coffee shops
 *     description: Returns a list of coffee shops with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved coffee shops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "Urban Brew Cafe"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/coffee-shop.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Mon-Fri: 7:00 AM - 7:00 PM, Sat-Sun: 8:00 AM - 6:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch coffee shops data"
 */