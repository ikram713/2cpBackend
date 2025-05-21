const express = require('express');
const router = express.Router();
const LikedService = require('../../Schema/LikedServiceSchema.js');

const Restaurant = require('../../Schema/RestaurantSchema.js');
const Administration = require('../../Schema/administrationSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');

// Map service types to their corresponding Mongoose models
const serviceModels = {
    'restaurant': Restaurant,
    'administration': Administration,
    'privateschool': PrivateSchool,
    'coffeeshop': CoffeeShop,
    'medicalassistant': MedicalAssistant,
    'grocerie': Grocerie,
    'deleiveryoffice': DeleiveryOffice
};

router.get('/liked-List', async (req, res) => {
    console.log("Session Data:", req.session);
    console.log("User in session:", req.user);

    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const email = req.user.email;
    console.log("Fetching liked services for:", email);

    try {
        const likedServices = await LikedService.find({ email });
        console.log("Liked Services Found:", likedServices);

        if (!likedServices.length) {
            return res.json([]); // No liked services
        }

        let likedList = [];

        for (let liked of likedServices) {
            const { serviceName, serviceType } = liked;

            if (!serviceName || !serviceType) continue;

            const typeKey = serviceType.toLowerCase();
            const serviceModel = serviceModels[typeKey];

            if (serviceModel) {
                // Case-insensitive match on service name
                const service = await serviceModel.findOne({ Name: new RegExp(`^${serviceName}$`, 'i') }).select('-__v');

                if (service) {
                    // Push full service data + type
                    likedList.push({
                        ...service.toObject(),
                        serviceType: typeKey
                    });
                }
            } else {
                console.warn(`No model found for type: ${typeKey}`);
            }
        }

        return res.json(likedList);

    } catch (err) {
        console.error("Error fetching liked list:", err);
        return res.status(500).json({ message: "Server error fetching liked services" });
    }
});

module.exports = router;


