const express = require('express');
const router = express.Router();
const LikedService = require('../../Schema/LikedServiceSchema.js');
const Restaurant = require('../../Schema/RestaurantSchema.js');
const Administration = require('../../Schema/administrationSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');

const Comment = require('../../Schema/CommentSchema.js'); // Import the Comment model

const serviceModels = {
    'privateSchool': PrivateSchool,
    'restaurant': Restaurant,
    'administration': Administration,
    'coffeeshop': CoffeeShop,
    'grocerie': Grocerie,
    'medicalassistant': MedicalAssistant,
    'deleiveryoffice': DeleiveryOffice
};

// Route to display comments for a specific service
router.get('/displayComments/:serviceType/:serviceName', async (req, res) => {
    try {
        const { serviceType, serviceName } = req.params;

        // Validate service type
        if (!serviceModels[serviceType]) {
            return res.status(400).json({ message: "Invalid Service Type" });
        }

        // Find the service by name in the appropriate collection
        const ServiceModel = serviceModels[serviceType];
        const service = await ServiceModel.findOne({ Name: serviceName });

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Fetch all comments for the specified service type and name
        const comments = await Comment.find({ serviceType, serviceName });

        return res.status(200).json({ comments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

/**
 * @swagger
 * /displayComments/{serviceType}/{serviceName}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get all comments for a specific service
 *     description: |
 *       Retrieves all comments associated with a particular service.
 *       The service type must be one of the valid types (privateSchool, restaurant, administration, etc.).
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [privateSchool, restaurant, administration, coffeeshop, grocerie, medicalassistant, deleiveryoffice]
 *         description: The type of service to fetch comments for
 *         example: restaurant
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the specific service
 *         example: "Delicious Bistro"
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid service type provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Service Type"
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Service not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The comment ID
 *           example: "507f1f77bcf86cd799439011"
 *         serviceType:
 *           type: string
 *           description: Type of service the comment belongs to
 *           example: "restaurant"
 *         serviceName:
 *           type: string
 *           description: Name of the service
 *           example: "Delicious Bistro"
 *         userEmail:
 *           type: string
 *           description: Email of the user who made the comment
 *           example: "user@example.com"
 *         comment:
 *           type: string
 *           description: The comment text
 *           example: "Great food and service!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was created
 *           example: "2023-04-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was last updated
 *           example: "2023-04-01T12:00:00Z"
 */