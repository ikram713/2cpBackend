// CommentSchema.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true,
        enum: ['university', 'restaurant', 'administration', 'coffeeshop', 'grocerie', 'medicalassistant', 'deleiveryoffice']
    },
    serviceName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        maxlength: 500
    },
    likes: {
        type: [String], // Array of user emails who liked the comment
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);