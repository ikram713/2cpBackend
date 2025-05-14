const mongoose = require('mongoose');

// Define a schema for working hours (open/close time per day)
const workingHoursSchema = new mongoose.Schema({
    day: { type: String, required: true }, // Example: "Monday"
    openAt: { type: String, required: true }, // Example: "08:00 AM"
    closeAt: { type: String, required: true } // Example: "06:00 PM"
});

// PrivateSchool Schema
const PrivateSchoolSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique:true
    },
    Abbreviation:{
        type: String,
        
    },    
    Location: {
        type: String,
        required: false,
        unique: false
    },

    Coordinates: {
        latitude: { type: Number, required: true },//-90 to 90.
        longitude: { type: Number, required: true },//-180 to 180.
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
    Description: {
        type: String, // This makes it an array of strings
        required: false,
        default: null,
    },
    Features : {
        type: [String], // This makes it an array of strings
        required: false,
        default: null,
    },
    workingHours: [workingHoursSchema], // Array of open/close times per day
    ImgURL: { type: String },
    ServicesImages :{
        type :[String],
        default: null,
        required: false,
    }

});


PrivateSchoolSchema.index(
    { 'Coordinates.latitude': 1, 'Coordinates.longitude': 1 },
    { unique: true, partialFilterExpression: { 'Coordinates.latitude': { $exists: true }, 'Coordinates.longitude': { $exists: true } } }
);

const PrivateSchools = mongoose.model('PrivateSchools',PrivateSchoolSchema);
module.exports = PrivateSchools;