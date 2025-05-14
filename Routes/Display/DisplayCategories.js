
const express = require('express');
const router = express.Router();

router.get('/categories', async (req, res) => {
    try {
      const categories = [
        "Restaurant",
        "MedicalAssistant",
        "DeleiveryOffice",
        "Administration",
        "CoffeeShop",
        "Grocerie",
        "PrivateSchool"
    ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports =router;

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for retrieving service categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all available service categories
 *     tags: [Categories]
 *     description: Returns an array of all supported service categories
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 enum:
 *                   - "Restaurant"
 *                   - "MedicalAssistant"
 *                   - "DeleiveryOffice"
 *                   - "Administration"
 *                   - "CoffeeShop"
 *                   - "Grocerie"
 *                   - "PrivateSchool"
 *               example:
 *                 - "Restaurant"
 *                 - "MedicalAssistant"
 *                 - "DeleiveryOffice"
 *                 - "Administration"
 *                 - "CoffeeShop"
 *                 - "Grocerie"
 *                 - "PrivateSchool"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Error retrieving categories"
 */