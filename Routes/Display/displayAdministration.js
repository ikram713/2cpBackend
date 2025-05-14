
const express = require('express');
const router = express.Router();
const administration = require('../../Schema/administrationSchema.js');

//deleivery
router.get('/administration', async (req, res) => {
    try {
        const data = await administration.find({}, { Name: 1, ImgURL: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching administration:', err);
        res.status(500).json({ message: 'Failed to fetch administration.' });
    }
});


module.exports = router;

/**
 * @swagger
 * /administration:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all administration offices
 *     description: Returns a list of all administration offices with only their names and image URLs
 *     responses:
 *       200:
 *         description: Successfully retrieved administration offices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "City Hall"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/city-hall.jpg"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch administration offices"
 */