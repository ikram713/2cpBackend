const mongoose = require('mongoose');


// Define a schema for working hours (open/close time per day)
const workingHoursSchema = new mongoose.Schema({
    day: { type: String, required: true }, // Example: "Monday"
    openAt: { type: String, required: true }, // Example: "08:00 AM"
    closeAt: { type: String, required: true } // Example: "06:00 PM"
});

// Main MedicalAssistant Schema
const MedicalAssistantSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
        unique: true
    },
    Type: {
        type: String,
        enum: ['Clinique', 'Hospital', 'Doctor','Pharmacy'], // Supports clinics, hospitals, and doctors
        required: true
    },
    Specialty: {
        type: String,
        enum: [
            'Dentist', 'General Practitioner', 'Cardiologist', 
            'Neurologist', 'Orthopedic', 'Pediatrician'
        ],
        required: function() {
            return this.type === 'Doctor'; // Specialty is required only for doctors
        }
    },
    Location: {
        type: String,
        required: false,
        unique: false
    },
    Coordinates: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
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
    ImgURL: { 
        type: String 
    }
    ,
    ServicesImages :{
        type :[String],
        default: null,
        required: false,
    }
});

// Index for location-based search
//this line of code causes duplicate error 
// MedicalAssistantSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 }, { unique: true });
//alow non -null values to be unique ..but null values also allowed 
MedicalAssistantSchema.index(
    { 'Coordinates.latitude': 1, 'Coordinates.longitude': 1 },
    { unique: true, partialFilterExpression: { 'Coordinates.latitude': { $exists: true }, 'Coordinates.longitude': { $exists: true } } }
);

const MedicalAssistant = mongoose.model('MedicalAssistant',MedicalAssistantSchema);

module.exports = MedicalAssistant;
