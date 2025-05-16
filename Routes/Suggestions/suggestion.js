
const express = require('express');
const router = express.Router();
const LikedService = require('../../Schema/LikedServiceSchema.js');
const SearchHistory = require('../../Schema/SearchHistoryGlobal.js');
const Restaurant = require('../../Schema/RestaurantSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const Administration = require('../../Schema/administrationSchema.js');

// Function to calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Difference in latitudes in radians
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Difference in longitudes in radians

    // Apply Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Central angle
    return R * c; // Distance in kilometers
}


router.get('/suggestions', async (req, res) => {
    try {
        //Checking User Authentication
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }

        const email = req.user.email;

        // Fetch liked services
        const likedServices = await LikedService.find({ email });
       
        let suggestions = [];

        if (likedServices.length > 0) {
            // If there are liked services, fetch suggestions based on them
            for (let service of likedServices) {
                let categoryCollection;
                //Save Category of service type liked the most
                const serviceTypeLower = service.serviceType.toLowerCase();//lower case always better
                switch (serviceTypeLower) {
                    case 'restaurant':
                        categoryCollection = Restaurant;
                        break;
                    case 'coffeeshop':
                        categoryCollection = CoffeeShop;
                        break;
                    case 'privateschool':
                        categoryCollection = PrivateSchool;
                        break;
                    case 'medicalassistant':
                        categoryCollection = MedicalAssistant;
                        break;
                    case 'grocerie':
                        categoryCollection = Grocerie;
                        break;
                    case 'deleiveryoffice':
                        categoryCollection = DeleiveryOffice;
                        break;
                     case 'administration':
                        categoryCollection = Administration;
                        break;
                    default:
                        continue;
                }

                // Find the liked service's details
                const likedServiceDetails = await categoryCollection.findOne({ Name: service.serviceName });


                if (!likedServiceDetails) {
                    console.log("no liked service found on data base ");
                    continue
                };



                //Retrieves the coordinates of the liked service 
                const { Coordinates } = likedServiceDetails;

                // Find other similar services in the same category
                let similarServices = await categoryCollection.find({ 
                    Name: { $ne: service.serviceName } // Exclude the liked one using $ne:not equal
                });

                // Calculate distance and sort by closest
                similarServices = similarServices
                    .map(s => ({
                        ...s._doc,
                        //  _doc : retreive only the data from the document not the additional properties like delete and update ..
                        distance: getDistance(Coordinates.latitude, Coordinates.longitude, s.Coordinates.latitude, s.Coordinates.longitude)
                    }))
                    .sort((a, b) => a.distance - b.distance) // Sort by nearest
                    .slice(0, 3); // Take top 3

                suggestions.push(...similarServices);
            }
        } 
        if (!suggestions.length){
            // If no liked services, randomly select 3 services from any category
            const randomServices = await Promise.all([
                //aggreagte is for random selected documents
                Restaurant.aggregate([{ $sample: { size: 3 } }]),
                CoffeeShop.aggregate([{ $sample: { size: 3 } }]),
                PrivateSchool.aggregate([{ $sample: { size: 3 } }]),
                MedicalAssistant.aggregate([{ $sample: { size: 3 } }]),
                Grocerie.aggregate([{ $sample: { size: 3 } }]),
                DeleiveryOffice.aggregate([{ $sample: { size: 3} }]),
                Administration.aggregate([{ $sample: { size: 3} }])
            ]);

            // Flatten the array of random services
            //combines these arrays into a single array of services
            suggestions = randomServices.flat();
        }

        if (!suggestions.length) {
            return res.status(404).json({ message: "No suggestions found." });
        }

        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports =router;

/**
 * @swagger
 * tags:
 *   name: Suggestions
 *   description: Personalized service recommendations based on user preferences
 */

/**
 * @swagger
 * /suggestions:
 *   get:
 *     summary: Get personalized service suggestions
 *     description: |
 *       Returns service suggestions based on:
 *       - User's liked services (shows similar nearby services)
 *       - Random services from all categories if no liked services exist
 *       Calculates distances using Haversine formula
 *     tags: [Suggestions]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of suggested services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   Name:
 *                     type: string
 *                     example: "Coffee Place"
 *                   Location:
 *                     type: string
 *                     example: "123 Main St"
 *                   Coordinates:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                         format: float
 *                         example: 40.7128
 *                       longitude:
 *                         type: number
 *                         format: float
 *                         example: -74.0060
 *                   distance:
 *                     type: number
 *                     format: float
 *                     description: Distance in kilometers from liked service
 *                     example: 1.5
 *                   # Other service-specific properties will be included
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
 *         description: No suggestions available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No suggestions found."
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
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie for authentication
 */