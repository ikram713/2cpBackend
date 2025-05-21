const mongoose = require('mongoose');



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
    required: true,
    unique: false
},

    
latitude: { type: Number, required: true },
longitude: { type: Number, required: true },

  
      
        PhoneNumber: { // Corrected typo: CoffeeSchopPhoneNumber -> CoffeeShopPhoneNumber
            type: String,
            default: null,
            sparse: true,  // 👉 Rend l'unicité active *seulement* pour les valeurs non nulles
            unique: true
        },
   
    Description : {
        type: [String], // This makes it an array of strings
        required: false,
        default: null,
    },

workingHours: { type: [String], required: true }, // Array of open/close times per day
ImgURL: { type: String },
Type:{type:String},
ServiceImages :{
    type :[String],
    default: null,
    required: false,
}
});


const MedicalAssistant = mongoose.model('MedicalAssistant',MedicalAssistantSchema);

module.exports = MedicalAssistant;
