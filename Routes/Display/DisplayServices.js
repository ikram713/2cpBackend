
const express = require('express');
const router = express.Router();

router.get('/:servicetype/services', async (req, res) => {
    try {
        const servicetype =req.params;
        const services = await servicetype.find();
        res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports =router;

/**
 * @swagger
 * /{serviceType}/services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services by type
 *     description: Retrieve a list of all services of a specific type
 *     parameters:
 *       - in: path
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [restaurant, privateSchool, administration, coffeeShop, grocery, medicalAssistant, deliveryOffice]
 *         description: The type of service to retrieve
 *         example: restaurant
 *     responses:
 *       200:
 *         description: A list of services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving services"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "Example Restaurant"
 *         type:
 *           type: string
 *           example: "restaurant"
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00Z"
 */