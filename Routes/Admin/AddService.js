
// const express = require('express');
// const session = require('express-session');
// const MongodbSession = require('connect-mongodb-session')(session);
// const router = express.Router();

// // Import service schemas
// const Administration = require('../../Schema/administrationSchema.js');
// const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
// const Restaurant = require('../../Schema/RestaurantSchema.js');
// const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
// const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
// const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
// const Grocerie = require('../../Schema/GrocerieSchema.js');

// const serviceSchemas = {
//     administration: Administration,
//     coffeeShop: CoffeeShop,
//     restaurant: Restaurant,
//     privateSchool: PrivateSchool,
//     deleiveryOffice: DeleiveryOffice,
//     medicalAssistant: MedicalAssistant,
//     grocerie: Grocerie
// };
// //ADD SERVICE 
// // Default image
// const DEFAULT_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

// // Generic route for adding a service
// router.post('/addService/:servicetype', async (req, res) => {
//     try {
//         const { servicetype } = req.params; // Ensure servicetype is in lowercase

//         // Check if the service type is valid
//         if (!serviceSchemas[servicetype]) {
//             return res.status(400).send({ error: "Invalid service type" });
//         }

//         const ServiceModel = serviceSchemas[servicetype];

//         // Extract fields from request body
//         const {
//             Name,
//             Location,
//             Coordinates,
//             Contact, // Extract the Contact object 
//             workingHours,
//             AverageRating,
//             ImageURL,
//             ServicesImages,
//             Specialty,
//             CuisineType,
//             Features,
//             Type,
//             Description
//         } = req.body;

//         // Validate required fields
//         if (!Name || !Location || !Coordinates) {
//             return res.status(400).send({ error: "Missing required fields" });
//         }

//         // Validate coordinates
//         if (Coordinates.latitude < -90 || Coordinates.latitude > 90 ||
//             Coordinates.longitude < -180 || Coordinates.longitude > 180) {
//             return res.status(400).send({ error: "Invalid latitude or longitude values" });
//         }

//         // Check if the service already exists
//         const existingService = await ServiceModel.findOne({ Name, Location });
//         if (existingService) {
//             return res.status(400).send({ error: "Service already exists." });
//         }

//         // Base service object
//         let newServiceData = {
//             Name,
//             Location,
//             Coordinates,
//             Contact: {
//                 Fb: Contact?.Fb || null, // Default to null if not provided
//                 Insta: Contact?.Insta || null, // Default to null if not provided
//                 Website: Contact?.Website || null, // Default to null if not provided
//                 PhoneNumber: Contact?.PhoneNumber || null // Default to null if not provided
//             },
//             Features,
//             workingHours: workingHours || [],
//             AverageRating: AverageRating || 0,
//             ImgURL: ImageURL || DEFAULT_IMAGE_URL,
//             Description,
//             ServicesImages
//         };

//         // Conditionally add fields based on the service type
//         switch (servicetype) {
//             case "medicalAssistant":
//                 newServiceData.Specialty = Specialty || "";
//                 newServiceData.Type = Type || "";
//                 break;
//             case "administration":
//                 newServiceData.Type = Type || "";
//                 break;
//             case "restaurant":
//                 newServiceData.CuisineType = CuisineType || "";
//                 break;
//         }

//         // Create new service instance
//         const newService = new ServiceModel(newServiceData);
//         await newService.save();

//         // Send success response
//         res.status(201).send({ message: "Service created successfully", data: newService });
//     } catch (error) {
//         console.error("Error creating service:", error);
//         res.status(500).send({ error: "Internal server error" });
//     }
// });
// module.exports = router;

/// Dependencies
const express = require('express');
const session = require('express-session');
const MongodbSession = require('connect-mongodb-session')(session);
const multer = require('multer');
const cloudinary = require('../../Config/cloudinary');
const router = express.Router();

// Service Schemas
const Administration = require('../../Schema/administrationSchema.js');
const CoffeeShop = require('../../Schema/CoffeeShopSchema.js');
const Restaurant = require('../../Schema/RestaurantSchema.js');
const PrivateSchool = require('../../Schema/PrivateSchoolSchema.js');
const DeleiveryOffice = require('../../Schema/DeleiveryOfficeSchema.js');
const MedicalAssistant = require('../../Schema/MedicalAssistant.js');
const Grocerie = require('../../Schema/GrocerieSchema.js');

const serviceSchemas = {
    administration: Administration,
    coffeeShop: CoffeeShop,
    restaurant: Restaurant,
    privateSchool: PrivateSchool,
    deleiveryOffice: DeleiveryOffice,
    medicalAssistant: MedicalAssistant,
    grocerie: Grocerie
};

// Debug route to check what fields are coming in
router.post('/debug', multer().any(), (req, res) => {
    console.log('Content-Type:', req.get('content-type'));
    console.log('Body fields:', Object.keys(req.body));
    console.log('Files:', req.files ? req.files.map(f => f.fieldname) : 'No files');
    res.send({
        contentType: req.get('content-type'),
        bodyFields: Object.keys(req.body),
        fileFields: req.files ? req.files.map(f => f.fieldname) : []
    });
});

// Multer Config - Use .any() to accept all fields
const upload = multer({ storage: multer.memoryStorage() }).any();

const DEFAULT_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

// Add Service Route
router.post('/addService/:servicetype', upload, async (req, res) => {
    try {
        const { servicetype } = req.params;

        if (!serviceSchemas[servicetype]) {
            return res.status(400).send({ error: "Invalid service type" });
        }

        const ServiceModel = serviceSchemas[servicetype];

        // Log incoming data for debugging
        console.log('Files received:', req.files ? req.files.map(f => f.fieldname) : 'No files');
        console.log('Body fields:', Object.keys(req.body));

        // Image upload logic
        let imageUrl = DEFAULT_IMAGE_URL;
        let servicesImagesUrls = [];

        // Process ImgURL (main image)
        const mainImageFile = req.files ? req.files.find(f => f.fieldname === 'ImgURL') : null;
        if (mainImageFile) {
            const base64 = `data:${mainImageFile.mimetype};base64,${mainImageFile.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, { folder: 'services' });
            imageUrl = result.secure_url;
        }

        // Process service images - look for the exact field name as in your Postman
        const serviceImageFiles = req.files ? req.files.filter(f => f.fieldname === 'ServiceImages') : [];
        
        console.log(`Found ${serviceImageFiles.length} service images`);
        
        for (const file of serviceImageFiles) {
            const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, { folder: 'services' });
            servicesImagesUrls.push(result.secure_url);
        }

        console.log(`Uploaded ${servicesImagesUrls.length} service images to Cloudinary`);
        

        // Parse and validate other fields
        const {
            Name, Location, Coordinates: rawCoordinates, Contact: rawContact,
            workingHours, AverageRating, Specialty, CuisineType, Features,
            Type, Description
        } = req.body;

        // Safely parse JSON fields
        let Coordinates = {};
        try {
            Coordinates = rawCoordinates ? JSON.parse(rawCoordinates) : {};
        } catch (e) {
            return res.status(400).send({ error: "Invalid Coordinates format" });
        }

        let Contact = {};
        try {
            Contact = rawContact ? JSON.parse(rawContact) : {};
        } catch (e) {
            return res.status(400).send({ error: "Invalid Contact format" });
        }

        let parsedFeatures = [];
        try {
            parsedFeatures = Features ? JSON.parse(Features) : [];
        } catch (e) {
            return res.status(400).send({ error: "Invalid Features format" });
        }

        let parsedWorkingHours = [];
        try {
            parsedWorkingHours = workingHours ? JSON.parse(workingHours) : [];
        } catch (e) {
            return res.status(400).send({ error: "Invalid workingHours format" });
        }

        if (!Name || !Location || !Coordinates.latitude || !Coordinates.longitude) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        if (Coordinates.latitude < -90 || Coordinates.latitude > 90 ||
            Coordinates.longitude < -180 || Coordinates.longitude > 180) {
            return res.status(400).send({ error: "Invalid latitude or longitude values" });
        }

        const existingService = await ServiceModel.findOne({ Name, Location });
        if (existingService) {
            return res.status(400).send({ error: "Service already exists." });
        }

        let newServiceData = {
            Name,
            Location,
            Coordinates,
            Contact: {
                Fb: Contact.Fb || null,
                Insta: Contact.Insta || null,
                Website: Contact.Website || null,
                PhoneNumber: Contact.PhoneNumber || null
            },
            Features: parsedFeatures,
            workingHours: parsedWorkingHours,
            AverageRating: parseFloat(AverageRating) || 0,
            ImgURL: imageUrl,
            Description: Description || '',
            ServicesImages: servicesImagesUrls
        };

        switch (servicetype) {
            case "medicalAssistant":
                newServiceData.Specialty = Specialty || "";
                newServiceData.Type = Type || "";
                break;
            case "administration":
                newServiceData.Type = Type || "";
                break;
            case "restaurant":
                newServiceData.CuisineType = CuisineType || "";
                break;
        }

        const newService = new ServiceModel(newServiceData);
        await newService.save();

        res.status(201).send({ message: "Service created successfully", data: newService });

    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).send({ error: "Internal server error", details: error.message });
    }
});

// Update Service Route
router.put('/updateService/:servicetype/:name', upload, async (req, res) => {
    try {
        const { servicetype, name } = req.params;

        if (!serviceSchemas[servicetype]) {
            return res.status(400).send({ error: "Invalid service type" });
        }

        const ServiceModel = serviceSchemas[servicetype];

        // Find the service by name
        const existingService = await ServiceModel.findOne({ Name: name });
        if (!existingService) {
            return res.status(404).send({ error: "Service not found" });
        }

        // Log incoming data for debugging
        console.log('Files received:', req.files ? req.files.map(f => f.fieldname) : 'No files');
        console.log('Body fields:', Object.keys(req.body));

        // Image upload logic - only if new images are provided
        let updateData = {};

        // Process ImgURL (main image) if provided
        const mainImageFile = req.files ? req.files.find(f => f.fieldname === 'ImgURL') : null;
        if (mainImageFile) {
            const base64 = `data:${mainImageFile.mimetype};base64,${mainImageFile.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64, { folder: 'services' });
            updateData.ImgURL = result.secure_url;
        }

        // Process service images if provided
        const serviceImageFiles = req.files ? req.files.filter(f => f.fieldname === 'ServiceImages') : [];
        if (serviceImageFiles.length > 0) {
            console.log(`Found ${serviceImageFiles.length} service images to update`);
            
            let servicesImagesUrls = [];
            for (const file of serviceImageFiles) {
                const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const result = await cloudinary.uploader.upload(base64, { folder: 'services' });
                servicesImagesUrls.push(result.secure_url);
            }
            
            console.log(`Uploaded ${servicesImagesUrls.length} service images to Cloudinary`);
            updateData.ServicesImages = servicesImagesUrls;
        }

        // Process other fields if provided
        const {
            Name, Location, Coordinates: rawCoordinates, Contact: rawContact,
            workingHours, AverageRating, Specialty, CuisineType, Features,
            Type, Description
        } = req.body;

        // Update name if provided
        if (Name) {
            // Check if the new name already exists (but not for the current service)
            const nameExists = await ServiceModel.findOne({ 
                Name, 
                _id: { $ne: existingService._id } 
            });
            
            if (nameExists) {
                return res.status(400).send({ error: "Service with this name already exists." });
            }
            
            updateData.Name = Name;
        }

        // Update location if provided
        if (Location) {
            updateData.Location = Location;
        }

        // Update coordinates if provided
        if (rawCoordinates) {
            try {
                const Coordinates = JSON.parse(rawCoordinates);
                
                if (Coordinates.latitude < -90 || Coordinates.latitude > 90 ||
                    Coordinates.longitude < -180 || Coordinates.longitude > 180) {
                    return res.status(400).send({ error: "Invalid latitude or longitude values" });
                }
                
                updateData.Coordinates = Coordinates;
            } catch (e) {
                return res.status(400).send({ error: "Invalid Coordinates format" });
            }
        }

        // Update contact if provided
        if (rawContact) {
            try {
                const Contact = JSON.parse(rawContact);
                updateData.Contact = {
                    Fb: Contact.Fb || existingService.Contact.Fb,
                    Insta: Contact.Insta || existingService.Contact.Insta,
                    Website: Contact.Website || existingService.Contact.Website,
                    PhoneNumber: Contact.PhoneNumber || existingService.Contact.PhoneNumber
                };
            } catch (e) {
                return res.status(400).send({ error: "Invalid Contact format" });
            }
        }
        

        // Update features if provided
        if (Features) {
            try {
                updateData.Features = JSON.parse(Features);
            } catch (e) {
                return res.status(400).send({ error: "Invalid Features format" });
            }
        }

        // Update working hours if provided
        if (workingHours) {
            try {
                updateData.workingHours = JSON.parse(workingHours);
            } catch (e) {
                return res.status(400).send({ error: "Invalid workingHours format" });
            }
        }

        // Update rating if provided
        if (AverageRating) {
            updateData.AverageRating = parseFloat(AverageRating);
        }

        // Update description if provided
        if (Description !== undefined) {
            updateData.Description = Description;
        }

        // Update service-specific fields based on the service type
        switch (servicetype) {
            case "medicalAssistant":
                if (Specialty) updateData.Specialty = Specialty;
                if (Type) updateData.Type = Type;
                break;
            case "administration":
                if (Type) updateData.Type = Type;
                break;
            case "restaurant":
                if (CuisineType) updateData.CuisineType = CuisineType;
                break;
        }

        // Update the service
        const updatedService = await ServiceModel.findByIdAndUpdate(
            existingService._id,
            { $set: updateData },
            { new: true }
        );

        res.status(200).send({ 
            message: "Service updated successfully", 
            data: updatedService 
        });

    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).send({ error: "Internal server error", details: error.message });
    }
});


// Delete Service Route with Cloudinary cleanup
router.delete('/deleteService/:servicetype/:name', async (req, res) => {
    try {
        const { servicetype, name } = req.params;

        if (!serviceSchemas[servicetype]) {
            return res.status(400).send({ error: "Invalid service type" });
        }

        const ServiceModel = serviceSchemas[servicetype];

        // Find the service by name
        const existingService = await ServiceModel.findOne({ Name: name });
        if (!existingService) {
            return res.status(404).send({ error: "Service not found" });
        }

        // Delete images from Cloudinary
        try {
            // Delete main image if it's not the default image
            if (existingService.ImgURL && existingService.ImgURL !== DEFAULT_IMAGE_URL) {
                // Extract public_id from Cloudinary URL
                const mainImagePublicId = existingService.ImgURL.split('/').slice(-2).join('/').split('.')[0];
                if (mainImagePublicId) {
                    await cloudinary.uploader.destroy(mainImagePublicId);
                    console.log(`Deleted main image: ${mainImagePublicId}`);
                }
            }

            // Delete all service images
            if (existingService.ServicesImages && existingService.ServicesImages.length > 0) {
                for (const imageUrl of existingService.ServicesImages) {
                    // Extract public_id from each image URL
                    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                        console.log(`Deleted service image: ${publicId}`);
                    }
                }
            }
        } catch (cloudinaryError) {
            console.error("Error deleting images from Cloudinary:", cloudinaryError);
            // Continue with service deletion even if image deletion fails
        }

        // Delete the service from the database
        await ServiceModel.findByIdAndDelete(existingService._id);

        res.status(200).send({ 
            message: "Service and associated images deleted successfully",
            deletedService: {
                Name: existingService.Name,
                Type: servicetype,
                Location: existingService.Location
            }
        });

    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).send({ error: "Internal server error", details: error.message });
    }
});

module.exports = router;

//  /**
//  * @swagger
//  * tags:
//  *   - name: Service Management
//  *     description: Endpoints for managing services (CRUD operations)
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Service:
//  *       type: object
//  *       properties:
//  *         Name:
//  *           type: string
//  *           example: "Example Service"
//  *         Location:
//  *           type: string
//  *           example: "123 Main St"
//  *         Coordinates:
//  *           type: object
//  *           properties:
//  *             latitude:
//  *               type: number
//  *               format: float
//  *               example: 40.7128
//  *             longitude:
//  *               type: number
//  *               format: float
//  *               example: -74.0060
//  *         Contact:
//  *           type: object
//  *           properties:
//  *             Fb:
//  *               type: string
//  *               example: "facebook.com/example"
//  *             Insta:
//  *               type: string
//  *               example: "instagram.com/example"
//  *             Website:
//  *               type: string
//  *               example: "example.com"
//  *             PhoneNumber:
//  *               type: string
//  *               example: "+1234567890"
//  *         Features:
//  *           type: array
//  *           items:
//  *             type: string
//  *           example: ["WiFi", "Parking"]
//  *         workingHours:
//  *           type: array
//  *           items:
//  *             type: string
//  *           example: ["Mon-Fri 9AM-5PM"]
//  *         AverageRating:
//  *           type: number
//  *           format: float
//  *           example: 4.5
//  *         ImgURL:
//  *           type: string
//  *           example: "https://example.com/image.jpg"
//  *         Description:
//  *           type: string
//  *           example: "A great service"
//  *         ServicesImages:
//  *           type: array
//  *           items:
//  *             type: string
//  *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
//  *         Specialty:
//  *           type: string
//  *           example: "Cardiology"
//  *         Type:
//  *           type: string
//  *           example: "Hospital"
//  *         CuisineType:
//  *           type: string
//  *           example: "Italian"
//  *   securitySchemes:
//  *     cookieAuth:
//  *       type: apiKey
//  *       in: cookie
//  *       name: connect.sid
//  */

// /**
//  * @swagger
//  * /addService/{servicetype}:
//  *   post:
//  *     summary: Add a new service
//  *     tags: [Service Management]
//  *     consumes:
//  *       - multipart/form-data
//  *     parameters:
//  *       - in: path
//  *         name: servicetype
//  *         required: true
//  *         schema:
//  *           type: string
//  *           enum: [administration, coffeeShop, restaurant, privateSchool, deleiveryOffice, medicalAssistant, grocerie]
//  *         description: Type of service to add
//  *     requestBody:
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               Name:
//  *                 type: string
//  *               Location:
//  *                 type: string
//  *               Coordinates:
//  *                 type: string
//  *                 description: JSON string of {latitude: number, longitude: number}
//  *               Contact:
//  *                 type: string
//  *                 description: JSON string of contact info
//  *               workingHours:
//  *                 type: string
//  *                 description: JSON array of strings
//  *               AverageRating:
//  *                 type: number
//  *               Features:
//  *                 type: string
//  *                 description: JSON array of strings
//  *               Description:
//  *                 type: string
//  *               Specialty:
//  *                 type: string
//  *               Type:
//  *                 type: string
//  *               CuisineType:
//  *                 type: string
//  *               ImgURL:
//  *                 type: string
//  *                 format: binary
//  *               ServiceImages:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *     responses:
//  *       201:
//  *         description: Service created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/Service'
//  *       400:
//  *         description: Invalid input or service already exists
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /updateService/{servicetype}/{name}:
//  *   put:
//  *     summary: Update an existing service
//  *     tags: [Service Management]
//  *     consumes:
//  *       - multipart/form-data
//  *     parameters:
//  *       - in: path
//  *         name: servicetype
//  *         required: true
//  *         schema:
//  *           type: string
//  *           enum: [administration, coffeeShop, restaurant, privateSchool, deleiveryOffice, medicalAssistant, grocerie]
//  *       - in: path
//  *         name: name
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               Name:
//  *                 type: string
//  *               Location:
//  *                 type: string
//  *               Coordinates:
//  *                 type: string
//  *               Contact:
//  *                 type: string
//  *               workingHours:
//  *                 type: string
//  *               AverageRating:
//  *                 type: number
//  *               Features:
//  *                 type: string
//  *               Description:
//  *                 type: string
//  *               Specialty:
//  *                 type: string
//  *               Type:
//  *                 type: string
//  *               CuisineType:
//  *                 type: string
//  *               ImgURL:
//  *                 type: string
//  *                 format: binary
//  *               ServiceImages:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *     responses:
//  *       200:
//  *         description: Service updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 data:
//  *                   $ref: '#/components/schemas/Service'
//  *       400:
//  *         description: Invalid input
//  *       404:
//  *         description: Service not found
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /deleteService/{servicetype}/{name}:
//  *   delete:
//  *     summary: Delete a service
//  *     tags: [Service Management]
//  *     parameters:
//  *       - in: path
//  *         name: servicetype
//  *         required: true
//  *         schema:
//  *           type: string
//  *           enum: [administration, coffeeShop, restaurant, privateSchool, deleiveryOffice, medicalAssistant, grocerie]
//  *       - in: path
//  *         name: name
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Service deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 deletedService:
//  *                   type: object
//  *                   properties:
//  *                     Name:
//  *                       type: string
//  *                     Type:
//  *                       type: string
//  *                     Location:
//  *                       type: string
//  *       400:
//  *         description: Invalid service type
//  *       404:
//  *         description: Service not found
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /debug:
//  *   post:
//  *     summary: Debug endpoint for testing file uploads
//  *     tags: [Service Management]
//  *     consumes:
//  *       - multipart/form-data
//  *     requestBody:
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               file:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Debug information
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 contentType:
//  *                   type: string
//  *                 bodyFields:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  *                 fileFields:
//  *                   type: array
//  *                   items:
//  *                     type: string
//  */