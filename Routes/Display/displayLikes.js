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

// Define a mapping from service types to models
const serviceModels = {
    'privateSchool': PrivateSchool,
    'restaurant': Restaurant,
    'administration': Administration,
    'coffeeshop': CoffeeShop,
    'grocerie': Grocerie,
    'medicalassistant': MedicalAssistant,
    'deleiveryoffice': DeleiveryOffice
};

router.get('/liked-List', async (req, res) => {
    console.log("Session Data:", req.session); // Debug session
    console.log("User in session:", req.user); // Passport stores user in req.user

    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const email = req.user.email;
    console.log("Fetching liked services for:", email);

    const likedServices = await LikedService.find({ email });
    console.log("Liked Services Found:", likedServices); // Check fetched services

    if (!likedServices || likedServices.length === 0) {
        console.log("No liked services found.");
        return res.json([]); // Return empty array if no liked services
    }

    // Array to store the service data
    let likedList = [];

    // Loop through liked services
    for (let liked of likedServices) {
        const { serviceName, serviceType } = liked;

        if (!serviceName || !serviceType) {continue}; // Skip if serviceName or serviceType is missing

        const serviceTypeLower = serviceType.toLowerCase();
        const serviceModel = serviceModels[serviceTypeLower]; // Dynamically fetch the model

        if (serviceModel) {
            // Query the service model based on the service type
            const serviceData = await serviceModel.find({ Name: serviceName }).select('-_id -__v');
            if (serviceData && serviceData.length > 0) {
                likedList.push(serviceData[0]); // Push the first result into the list
            }
        }
    }

    return res.json(likedList); // Return the liked list
});

router.delete('/delete-liked-List', async (req, res) => {
    console.log("Session Data:", req.session); // Debug session
    console.log("User in session:", req.user); // Passport stores user in req.user

    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const email = req.user.email;
    console.log("Deleting all liked services for:", email);

    try {
        // Delete all liked services for the current user
        const result = await LikedService.deleteMany({ email });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No liked services found to delete" });
        }

        return res.status(200).json({ message: "All liked services deleted successfully!" });
    } catch (error) {
        console.error("Error deleting liked services:", error);
        return res.status(500).json({ message: "Error deleting liked services" });
    }
});


module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Liked Services
 *   description: Endpoints for managing user's liked services
 */

/**
 * @swagger
 * /liked-List:
 *   get:
 *     summary: Get user's liked services list
 *     tags: [Liked Services]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of liked services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                     description: Name of the service
 *                   Location:
 *                     type: string
 *                     description: Location of the service
 *                   # Add other common service properties here
 *               example:
 *                 - Name: "Coffee Place"
 *                   Location: "123 Main St"
 *                   CuisineType: "Coffee & Tea"
 *                 - Name: "Pizza Restaurant"
 *                   Location: "456 Oak Ave"
 *                   CuisineType: "Italian"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User not logged in"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /delete-liked-List:
 *   delete:
 *     summary: Delete all liked services for current user
 *     tags: [Liked Services]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted liked services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All liked services deleted successfully!"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: User not logged in"
 *       404:
 *         description: No liked services found to delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No liked services found to delete"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting liked services"
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie for authentication
 */