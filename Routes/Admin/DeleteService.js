const express = require('express');
const router = express.Router();

// Import service schemas
const Administration = require('../../Schema/administrationSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const Restaurant = require('../../Schema/RestaurantSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');

const serviceSchemas = {
    administration: Administration,
    coffeeShop: CoffeeShop,
    restaurant: Restaurant,
    privateSchool: PrivateSchool,
    deleiveryOffice: DeleiveryOffice,
    medicalAssistant: MedicalAssistant,
    grocerie: Grocerie
};

// Generic route for deleting a service by Name
router.delete('/deleteService/:servicetype/:Name', async (req, res) => {
    try {
        const { servicetype, Name } = req.params;

        // Check if the service type is valid
        if (!serviceSchemas[servicetype]) {
            return res.status(400).send({ error: "Invalid service type" });
        }

        const ServiceModel = serviceSchemas[servicetype];

        // Check if the service exists by Name
        const existingService = await ServiceModel.findOne({ Name });
        if (!existingService) {
            return res.status(404).send({ error: "Service not found." });
        }

        // Delete the service by Name
        await ServiceModel.deleteOne({ Name });

        res.send({ message: `${servicetype} service with Name '${Name}' deleted successfully` });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error deleting service" });
    }
});

//DELETE ALL SERVICES 
router.delete('/deleteAllServices', async (req, res) => {
    try {
        const deleteResults = {};

        for (const [serviceType, ServiceModel] of Object.entries(serviceSchemas)) {
            const result = await ServiceModel.deleteMany({});
            deleteResults[serviceType] = result.deletedCount; // Number of deleted documents
            console.log(`Deleted ${result.deletedCount} documents from ${serviceType}`); // Debugging
        }

        res.status(200).send({
            message: "All services deleted successfully",
            deleteResults
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error deleting services", details: error.message });
    }
});
module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management endpoints
 */

/**
 * @swagger
 * /deleteService/{servicetype}/{Name}:
 *   delete:
 *     summary: Delete a specific service by name and type
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: servicetype
 *         required: true
 *         schema:
 *           type: string
 *           enum: [administration, coffeeShop, restaurant, privateSchool, deleiveryOffice, medicalAssistant, grocerie]
 *         description: Type of the service to delete
 *       - in: path
 *         name: Name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the service to delete
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "coffeeShop service with Name 'Starbucks' deleted successfully"
 *       400:
 *         description: Invalid service type
 *       404:
 *         description: Service not found
 *       500:
 *         description: Error deleting service
 */

/**
 * @swagger
 * /deleteAllServices:
 *   delete:
 *     summary: Delete all services of all types
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: All services deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All services deleted successfully"
 *                 deleteResults:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     administration: 5
 *                     coffeeShop: 3
 *                     restaurant: 7
 *       500:
 *         description: Error deleting services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */