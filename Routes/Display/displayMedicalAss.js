const express = require('express');
const router = express.Router();
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');


router.get('/medicalAssistants', async (req, res) => {
    try {
        const data = await MedicalAssistant.find({}, { Name: 1, ImgURL: 1, workingHours: 1, _id: 0 }); // project only Name and ImgURL
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching medicalAssistants:', err);
        res.status(500).json({ message: 'Failed to fetch medicalAssistants.' });
    }
});

// Helper function to get data by type
const getMedicalAssistantsByType = async (type, res) => {
    try { 
        const data = await MedicalAssistant.find(
            { Type: type },
            { Name: 1, ImgURL: 1, workingHours: 1, Type: 1, _id: 0 }
        );
        res.status(200).json(data);
    } catch (err) {
        console.error(`Error fetching ${type} data:`, err);
        res.status(500).json({ message: `Failed to fetch ${type} data.` });
    }
};



// Route: Get all Doctors
router.get('/medicalAssistants/doctors', async (req, res) => {
    await getMedicalAssistantsByType('Doctor', res);
});

// Route: Get all Clinics
router.get('/medicalAssistants/clinics', async (req, res) => {
    await getMedicalAssistantsByType('Clinique', res);
});

// Route: Get all Hospitals
router.get('/medicalAssistants/hospitals', async (req, res) => {
    await getMedicalAssistantsByType('Hospital', res);
});

// Route: Get all Pharmacies
router.get('/medicalAssistants/pharmacies', async (req, res) => {
    await getMedicalAssistantsByType('Pharmacy', res);
});

module.exports = router;

