const mongoose = require('mongoose');

// Define a schema for working hours (open/close time per day)
const workingHoursSchema = new mongoose.Schema({
    day: { type: String, required: true }, // Example: "Monday"
    openAt: { type: String, required: true }, // Example: "08:00 AM"
    closeAt: { type: String, required: true } // Example: "06:00 PM"
});

// CoffeeShop Schema
const CoffeeShopSchema = new mongoose.Schema({
    Name: { // Corrected typo: CoffeeSchopName -> CoffeeShopName
        type: String,
        required: true,
        unique: true

    },
    Location: {
        type: String,
        required: false,
        unique: false

    },
    Coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    Contact :{
        Fb:{
            type: String,
            default: null
        },
        Insta:{
            type: String,
            default: null
        },
        Website:{
            type: String,
            default: null
        },
        PhoneNumber: { // Corrected typo: CoffeeSchopPhoneNumber -> CoffeeShopPhoneNumber
            type: String,
            default: null
        }
    },
    Features : {
        type: [String], // This makes it an array of strings
        required: false,
        default: null,
    },
    Description: {
        type: String, // This makes it an array of strings
        required: false,
        default: null,
    },
    
    workingHours: [workingHoursSchema], // Array of open/close times per day
    Ratings: [{ type: Number, min: 1, max: 5 }],
    AverageRating: { type: Number, default: 0 },
    ImgURL: { type: String },
    ServicesImages :{
        type :[String],
        default: null,
        required: false,
    }
});
// Index for location-based search
//this line of code causes duplicate error 
// CoffeeShopSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 }, { unique: true });
//alow non -null values to be unique ..but null values also allowed 
CoffeeShopSchema.index(
    { 'Coordinates.latitude': 1, 'Coordinates.longitude': 1 },
    { unique: true, partialFilterExpression: { 'Coordinates.latitude': { $exists: true }, 'Coordinates.longitude': { $exists: true } } }
);
// Create the model
const CoffeeShops = mongoose.model('CoffeeShops', CoffeeShopSchema); // Corrected typo: CoffeeSchopSchema -> CoffeeShopSchema

module.exports = CoffeeShops;