
const express = require('express');
const router = express.Router();
const medicalAssistants = require('../../Schema/MedicalAssistant.js');


router.get('/medicalAssistants', async (req, res) => {
    try {
        const data = await medicalAssistants.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching medicalAssistants:', err);
        res.status(500).json({ message: 'Failed to fetch medicalAssistants.' });
    }
});

module.exports = router;

/**
 * @swagger
 * /medicalAssistants:
 *   get:
 *     tags:
 *       - Display Services
 *     summary: Get all medical assistants
 *     description: Returns a list of medical assistants with their names, image URLs, and working hours
 *     responses:
 *       200:
 *         description: Successfully retrieved medical assistants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     example: "City Medical Center"
 *                   ImgURL:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/medical-center.jpg"
 *                   workingHours:
 *                     type: string
 *                     example: "Mon-Fri: 8:00 AM - 5:00 PM"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch medical assistants data"
 */