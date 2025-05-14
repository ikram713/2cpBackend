
const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
    email: { type: String, required: true }, // 🔥 Use email instead of userId
    // userId: { type: String, required: true, unique: true }, // Unique ID for each user
    searches: { type: [String], default: [] } // Array to store search queries
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;