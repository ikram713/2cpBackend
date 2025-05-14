
const express = require('express');
const router = express.Router();
const deleiveryOffices = require('../../Schema/DeleiveryOfficeSchema.js');

//deleivery
router.get('/deleiveryOffices', async (req, res) => {
    try {
        const data = await deleiveryOffices.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching deleiveryOffices:', err);
        res.status(500).json({ message: 'Failed to fetch deleiveryOffices.' });
    }
});

module.exports = router;

/**
 * @swagger
 * /deliveryOffices:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all delivery offices
 *     description: Returns a list of delivery offices with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved delivery offices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "FedEx Downtown"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/fedex.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch delivery offices data"
 */