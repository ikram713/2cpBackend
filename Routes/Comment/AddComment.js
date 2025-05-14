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
    'privateschool': PrivateSchool,
    'restaurant': Restaurant,
    'administration': Administration,
    'coffeeshop': CoffeeShop,
    'grocerie': Grocerie,
    'medicalassistant': MedicalAssistant,
    'deleiveryoffice': DeleiveryOffice
};

// Route to add a comment for a service
router.post('/AddComment/:serviceType/:serviceName', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }

        const { serviceType, serviceName } = req.params;
        const { comment } = req.body;
        const userEmail = req.user.email; // Get the user's email from the Passport session

        // Validate service type
        if (!serviceModels[serviceType]) {
            return res.status(400).json({ message: "Invalid Service Type" });
        }

        // Validate comment
        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: "Comment cannot be empty" });
        }

        // Find the service by name in the appropriate collection
        const ServiceModel = serviceModels[serviceType];
        const service = await ServiceModel.findOne({ Name: serviceName });

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Create and save the new comment
        const newComment = new Comment({
            serviceType,
            serviceName,
            userEmail,
            comment
        });

        await newComment.save();

        return res.status(201).json({ message: "Comment added successfully", comment: newComment });

    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



module.exports = router;



/**
 * @swagger
 * /comments/AddComment/{serviceType}/{serviceName}:
 *   post:
 *     summary: Add a comment to a specific service
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of the service (e.g., restaurant, privateschool, etc.)
 *       - in: path
 *         name: serviceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the service to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Great place with excellent service!"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment added successfully
 *                 comment:
 *                   type: object
 *       400:
 *         description: Invalid request (e.g., missing comment, invalid service type)
 *       401:
 *         description: Unauthorized - user not logged in
 *       404:
 *         description: Service not found
 *       500:
 *         description: Internal server error
 */
