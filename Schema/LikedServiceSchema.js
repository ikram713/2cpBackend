const mongoose = require('mongoose');

const LikedServiceSchema = new mongoose.Schema({
    email: { type: String, required: true }, // 🔥 Use email instead of userId
    serviceName: { type: String, required: true },
    serviceType: { type: String, required: true }
});

const LikedService = mongoose.model('LikedService', LikedServiceSchema);
module.exports = LikedService;

