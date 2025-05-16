const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./Schema/AdminUser"); // Ensure correct path
require("dotenv").config(); // Load environment variables

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: "yakinegaouaou@example.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists!");
            mongoose.connection.close();
            return;
        }
        // Create an admin
        const admin = new Admin({
            email: "yakinegaouaou@gmail.com",
            password: "123",
            
            role: "admin"
        });

        await admin.save();
        console.log("✅ Admin created successfully! and added do dataBase");
        mongoose.connection.close();
    })
    .catch(err => console.error("❌ MongoDB connection error:", err));
