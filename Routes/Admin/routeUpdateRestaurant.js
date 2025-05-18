const router = require('express').Router();
const RestaurantSchema = require('../../Schema/RestaurantSchema.js');
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);





router.patch('/UpdateRestaurant',async (req,res)=>{
    try { 
    const {Name,Location,CuisineType, WorkingTime,Features} = req.body;
    let RestaurantExiste = await RestaurantSchema.findOne({Name,Location})
    if (!RestaurantExiste){
    res.send('this Restaurant does not exist');
    }
    else{
    await RestaurantSchema.updateOne({ Name,Location},{ $set:{CuisineType,WorkingTime,Features}});//Update a single field in a document without altering others.
    res.send("Restaurant Location updated successfully");
    }
    

} catch (error) {
    console.error(error);
    res.status(500).send('Error updating Restaurant Location');
}

})
    
module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management endpoints
 */

/**
 * @swagger
 * /UpdateRestaurant:
 *   patch:
 *     summary: Update a restaurant's information
 *     tags: [Restaurants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *               - Location
 *             properties:
 *               Name:
 *                 type: string
 *                 description: Name of the restaurant to update
 *                 example: "La Bella Napoli"
 *               Location:
 *                 type: string
 *                 description: Location of the restaurant to update
 *                 example: "123 Main St, New York"
 *               CuisineType:
 *                 type: string
 *                 description: Type of cuisine (optional update)
 *                 example: "Italian"
 *               WorkingTime:
 *                 type: string
 *                 description: Working hours (optional update)
 *                 example: "9AM-11PM"
 *               Features:
 *                 type: string
 *                 description: Special features (optional update)
 *                 example: "Outdoor seating, Live music"
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Restaurant updated successfully"
 *       400:
 *         description: Restaurant does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "this Restaurant does not exist"
 *       500:
 *         description: Error updating restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error updating Restaurant"
 */