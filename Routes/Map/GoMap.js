// const express = require("express");
// const router = express.Router();

// // Import all service schemas dynamically
// const Administration = require('../../Schema/administrationSchema.js');
// const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
// const Restaurant = require('../../Schema/RestaurantSchema.js');
// const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
// const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
// const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
// const Grocerie = require('../../Schema/GrocerieSchema.js');

// const serviceSchemas = {
//     administration: Administration,
//     coffeeshop: CoffeeShop,
//     restaurant: Restaurant,
//     PrivateSchool: PrivateSchool,
//     deleiveryoffice: DeleiveryOffice,
//     medicalassistant: MedicalAssistant,
//     grocerie: Grocerie
// };

// router.post("/GoMap", async (req, res) => {
//     try {
//         const { serviceType, serviceName } = req.body;

//         // Validate input
//         if (!serviceType || !serviceName) {
//             return res.status(400).json({ message: "Type et Name sont requis" });
//         }

//         // Normalize service type to lowercase
//         const serviceTypeLower = serviceType.toLowerCase();

//         // Ensure the service type exists in the schema
//         if (!serviceSchemas[serviceTypeLower]) {
//             return res.status(400).json({ message: "Type d'établissement invalide" });
//         }

//         const Model = serviceSchemas[serviceTypeLower];
//         const fieldName = "Name"; // Assuming all schemas have a "Name" field for querying

//         // Query the database to find the establishment by service name
//         const establishment = await Model.findOne({ [fieldName]: serviceName });

//         // Check if the establishment was found
//         if (!establishment) {
//             return res.status(404).json({ message: "Établissement non trouvé" });
//         }

//         // Return the coordinates (latitude and longitude)
//         res.json({
//             latitude: establishment.coordinates.latitude,
//             longitude: establishment.coordinates.longitude
//         });
//     } catch (error) {
//         // Catch any unexpected errors and send a response
//         console.error(error);
//         res.status(500).json({ message: "Erreur serveur", error: error.message });
//     }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

// Import all service schemas dynamically
const Administration = require('../../Schema/administrationSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const Restaurant = require('../../Schema/RestaurantSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');

const serviceSchemas = {
    administration: Administration,
    coffeeshop: CoffeeShop,
    restaurant: Restaurant,
    privateSchool: PrivateSchool,
    deleiveryoffice: DeleiveryOffice,
    medicalassistant: MedicalAssistant,
    grocerie: Grocerie
};

router.post("/GoMap", async (req, res) => {
    try {
        const { serviceType, serviceName } = req.body;

        // Validate input
        if (!serviceType || !serviceName) {
            return res.status(400).json({ message: "Type et Name sont requis" });
        }

        // Normalize service type to lowercase
        const serviceTypeLower = serviceType.toLowerCase();

        // Ensure the service type exists in the schema
        if (!serviceSchemas[serviceTypeLower]) {
            return res.status(400).json({ message: "Type d'établissement invalide" });
        }

        const Model = serviceSchemas[serviceTypeLower];
        const fieldName = "Name"; // Assuming all schemas have a "Name" field for querying

        // Query the database to find the establishment by service name
        const establishment = await Model.findOne({ [fieldName]: serviceName });

        // Check if the establishment was found
        if (!establishment) {
            return res.status(404).json({ message: "Établissement non trouvé" });
        }

        // Return the coordinates (latitude and longitude)
        res.json({
            latitude: establishment.coordinates.latitude,
            longitude: establishment.coordinates.longitude
        });
    } catch (error) {
        // Catch any unexpected errors and send a response
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Map Services
 *   description: Endpoints for map-related service operations
 */

/**
 * @swagger
 * /GoMap:
 *   post:
 *     summary: Get coordinates for a specific service
 *     description: Returns latitude and longitude for a given service name and type
 *     tags: [Map Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - serviceName
 *             properties:
 *               serviceType:
 *                 type: string
 *                 description: Type of service (case insensitive)
 *                 enum: [administration, coffeeshop, restaurant, privateSchool, deleiveryoffice, medicalassistant, grocerie]
 *                 example: "restaurant"
 *               serviceName:
 *                 type: string
 *                 description: Name of the establishment
 *                 example: "McDonald's"
 *     responses:
 *       200:
 *         description: Coordinates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 48.8566
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 2.3522
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Type et Name sont requis"
 *       404:
 *         description: Establishment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Établissement non trouvé"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */