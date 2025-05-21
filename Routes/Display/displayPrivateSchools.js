
const express = require('express');
const router = express.Router();
const privateSchools = require('../../Schema/PrivateSchoolSchema.js');


router.get('/privateSchools', async (req, res) => {
    try {
        const data = await privateSchools.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching privateSchools:', err);
        res.status(500).json({ message: 'Failed to fetch privateSchools.' });
    }
});

module.exports = router;

/**
 * @swagger
 * /privateSchools:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all private schools
 *     description: Returns a list of private schools with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved private schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "International School of Algiers"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/school-image.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Sun-Thu: 8:00 AM - 4:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch private schools data"
 */