const express = require('express');
const router = express.Router();

const Restaurant = require('../../Schema/RestaurantSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');

// Map the allowed service types to their corresponding Mongoose models
const serviceModels = {
    restaurant: Restaurant,
    coffeeshop: CoffeeShop,
    deleiveryoffice: DeleiveryOffice,
    grocerie: Grocerie
};

router.post('/rateService', async (req, res) => {
    try {
        const { serviceType, serviceName, rating } = req.body;

        if (!serviceType || !serviceName || rating === undefined) {
            return res.status(400).send('Missing serviceType, serviceName, or rating.');
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).send('Rating must be between 1 and 5.');
        }

        const model = serviceModels[serviceType.toLowerCase()];
        if (!model) {
            return res.status(400).send('Invalid service type. Allowed types: restaurant,grocerie, coffeeshop, deleiveryoffice.');
        }

        const service = await model.findOne({ Name: serviceName });
        if (!service) {
            return res.status(404).send('Service not found.');
        }

        service.Ratings.push(rating);

        const totalRatings = service.Ratings.length;
        const sumRatings = service.Ratings.reduce((a, b) => a + b, 0);
        service.AverageRating = sumRatings / totalRatings;

        await service.save();

        res.send(`Rating submitted. New average rating: ${service.AverageRating.toFixed(2)}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting rating.');
    }
});

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Service Ratings
 *   description: Endpoints for rating services
 */

/**
 * @swagger
 * /rateService:
 *   post:
 *     summary: Rate a service
 *     description: Submit a rating for a specific service and update its average rating
 *     tags: [Service Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceType
 *               - serviceName
 *               - rating
 *             properties:
 *               serviceType:
 *                 type: string
 *                 enum: [restaurant, coffeeshop, deleiveryoffice, grocerie]
 *                 description: Type of service to rate
 *                 example: "restaurant"
 *               serviceName:
 *                 type: string
 *                 description: Name of the service to rate
 *                 example: "Joe's Diner"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5 stars)
 *                 example: 4
 *     responses:
 *       200:
 *         description: Rating submitted successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Rating submitted. New average rating: 4.25"
 *       400:
 *         description: Invalid request
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 missingFields:
 *                   value: "Missing serviceType, serviceName, or rating."
 *                 invalidRating:
 *                   value: "Rating must be between 1 and 5."
 *                 invalidServiceType:
 *                   value: "Invalid service type. Allowed types: restaurant,grocerie, coffeeshop, deleiveryoffice."
 *       404:
 *         description: Service not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Service not found."
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error submitting rating."
 */