const mongoose = require('mongoose');


// Define a schema for working hours (open/close time per day)
const workingHoursSchema = new mongoose.Schema({
    day: { type: String, required: true }, // Example: "Monday"
    openAt: { type: String, required: true }, // Example: "08:00 AM"
    closeAt: { type: String, required: true } // Example: "06:00 PM"
}); 

// administration Schema
const AdministrationSchema = new mongoose.Schema({
    Name: {
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
    
    workingHours: [workingHoursSchema], // Array of open/close times per day
    ImgURL: { type: String },
    Type:{type:String, default:"administration"},
    ServicesImages :{
        type :[String],
        default: null,
        required: false,
    }
});

const Administration = mongoose.model('Administration',AdministrationSchema);
module.exports = Administration;  