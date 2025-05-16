const express = require('express');
const router = express.Router();
const Restaurant = require('../../Schema/RestaurantSchema.js');
const AdministrationService = require('../../Schema/administrationSchema.js');
const PrivateSchool =require('../../Schema/PrivateSchoolSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const SearchHistory = require('../../Schema/SearchHistoryGlobal.js');

// 
router.get('/Search/:key', async (req, res) => {
    const { key } = req.params;
    // const userId = req.user.id;
    const email =req.user.email
    if (!key) {
        return res.status(400).send({ error: "Search key is required" });
    }

    if (!email) {
        return res.status(401).send({ error: "User not authenticated" });
    }

    try {
        // Fetch the user's search history
        let userHistory = await SearchHistory.findOne({ email });

        if (!userHistory) {
            // If no document exists, create a new one
            userHistory = new SearchHistory({ email, searches: [] });


        }

        // Check if the search query already exists in the history
        const existingIndex = userHistory.searches.indexOf(key);
        if (existingIndex !== -1) {
            // Remove the existing query
            userHistory.searches.splice(existingIndex, 1);
        }

        // Add the search query to the end of the array
        userHistory.searches.push(key);

        // Keep only the last 10 searches
        if (userHistory.searches.length > 10) {
            userHistory.searches = userHistory.searches.slice(-10);
        }

        // Save the updated search history
        await userHistory.save();

        // Perform the global search
        const restaurantResults = await Restaurant.find({
            "$or": [
                { Name: { $regex: key, $options: "i" } },
                { CuisineType: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });
        
        const PrivateSchoolResults = await PrivateSchool.find({
            "$or": [
                { Name: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });

        const coffeeShopResults = await CoffeeShop.find({
            "$or": [
                { Name: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });
        const medicalResults = await MedicalAssistant.find({
            "$or": [
                { Name: { $regex: key, $options: "i" } },       // Doctor/Hospital/Pharmacy name
                { type: { $regex: key, $options: "i" } },       // Type (doctor, hospital, pharmacy, clinic)
                { specialty: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });
        const AdministrationServiceResults = await AdministrationService.find({
            "$or": [
                { Name: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });
        const GrocerieResults = await Grocerie.find({
            "$or": [
                { GrocerieName: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });
        const DeleiveryOfficeResults = await DeleiveryOffice.find({
            "$or": [
                { DeleiveryOfficeName: { $regex: key, $options: "i" } },
                { Description : { $regex: key, $options: "i" } },
                { Location : { $regex: key, $options: "i" } }
            ]
        });



        // Combine all results into an object
        const allResults = {
            restaurantResults,
            PrivateSchoolResults,
            AdministrationServiceResults,
            coffeeShopResults,
            medicalResults,
            GrocerieResults,
            DeleiveryOfficeResults
        };

        // Filter out empty arrays
        const filteredResults = Object.fromEntries(
            Object.entries(allResults).filter(([key, value]) => value.length > 0)
        );

        // Check if any results were found
        if (Object.keys(filteredResults).length === 0) {
            return res.status(404).send({ message: "No results found on dataBase." });
        }

        // Send the filtered results
        res.send(filteredResults);
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
module.exports=router;

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Global search functionality across all service types
 */

/**
 * @swagger
 * /Search/{key}:
 *   get:
 *     summary: Perform a global search across all service types
 *     description: |
 *       Searches across all service types (restaurants, schools, coffee shops, etc.) for the given key,
 *       updates the user's search history, and returns matching results.
 *       Only returns service types that have matching results.
 *     tags: [Search]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term to look for in service names, descriptions, locations, etc.
 *         example: "pizza"
 *     responses:
 *       200:
 *         description: Search results grouped by service type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Name:
 *                       type: string
 *                       example: "Pizza Place"
 *                     Location:
 *                       type: string
 *                       example: "123 Main St"
 *                     Description:
 *                       type: string
 *                       example: "Italian restaurant"
 *                     # Other service-specific properties will also be included
 *               example:
 *                 restaurantResults:
 *                   - Name: "Pizza Place"
 *                     Location: "123 Main St"
 *                     Description: "Italian restaurant"
 *                     CuisineType: "Italian"
 *                 coffeeShopResults:
 *                   - Name: "Coffee & Pizza"
 *                     Location: "456 Oak Ave"
 *                     Description: "Coffee shop serving light snacks"
 *       400:
 *         description: Bad request - missing search key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Search key is required"
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *       404:
 *         description: No results found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No results found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
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