const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalUser = require("../../Schema/LocalUser");
const GoogleUser = require("../../Schema/GoogleUser");
const sendOtpEmail = require("../../Config/sendOtp");
const router = express.Router();
const validator = require("validator");



//Delete all users and all his likes and search history
router.delete("/delete-all-users", async (req, res) => {
  try {
    // First, get the list of all users (you may have specific logic for identifying users)
    const users = await LocalUser.find({});

    // Loop through each user to delete their likes and search history
    for (const user of users) {
      // Delete likes for each user from the LikedService collection
      await LikedService.deleteMany({ email: user.email });
      
      // Delete search history for each user from the SearchHistory collection
      await SearchHistory.deleteMany({ email: user.email });
    }

    // Now delete the users from the respective collections
    await LocalUser.deleteMany({});
    await GoogleUser.deleteMany({});

    res.status(200).json({ message: "All users and their associated data deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ Local Signup Route
router.post("/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!validator.isEmail(email)) {
        return res.status(400).send("Invalid email format.");
      }
  
      let googleUserExists = await GoogleUser.findOne({ email });
      if (googleUserExists)
        return res.status(400).json({ message: "U are already signed up ,Use Google to log in" });
  
      let localUserExists = await LocalUser.findOne({ email });
      if (localUserExists)
        return res.status(400).json({ message: "Email already registered" });
  
      // ✅ Store user details in session instead of database
      req.session.otpUser = { name, email, password };
  
      // ✅ Generate and hash OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 12);
      req.session.otp = hashedOTP;
      req.session.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
  
      // ✅ Send OTP email
      await sendOtpEmail(email, otp);
    // console.log(req.session.otp)
      res.json({ message: "OTP sent to email. Please verify to continue." });
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
// ✅ Verify OTP Route
router.post("/verify-otp", async (req, res) => {
    try {
      const { otp } = req.body;
      
      // ✅ Retrieve user details from session
      if (!req.session.otpUser || !req.session.otp) {
        return res.status(400).send("Session expired. Please sign up again.");
      }
  
      const { name, email, password} = req.session.otpUser;
  
      // ✅ Check if OTP expired
      if (req.session.otpExpires < Date.now()) {
        return res.status(400).send("OTP expired. Please request a new one.");
      }
  
      // ✅ Verify OTP
      const isMatch = await bcrypt.compare(otp, req.session.otp);
      if (!isMatch) {
        return res.status(400).send("Incorrect OTP. Please try again.");
      }
  
      // ✅ Check if user already exists
      let user = await LocalUser.findOne({ email });
  
      if (user) {
        // If user exists but is not verified, update it
        user.isVerified = true;
        await user.save();
      } else {
        // Otherwise, create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new LocalUser({
          name,
          email,
          password: hashedPassword,
          isVerified: true,
        });
        await user.save();
        console.log("✅ New user created:", user);
      }
  
      // ✅ Auto-login user after successful OTP verification
      req.logIn(user, (err) => {
        if (err) return res.status(500).send("Session error. Please log in manually.");
  
        // ✅ Clear OTP from session after successful login
        req.session.otpUser = null;
        req.session.otp = null;
        req.session.otpExpires = null;
  
        res.status(200).json({ message: "Email verified and logged in successfully!", user: req.user });
      });
  
    } catch (error) {
      console.error("❌ Error in verify-otp:", error);
      res.status(500).json({ message: error.message });
    }
  });

  

// ✅ Local Login Route

router.post("/login", async (req, res, next) => {
  try {
    const { email,password } = req.body;

    // Check if the email exists in the database and if it was registered via Google
    const existingUser = await GoogleUser.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "This email is registered with Google. Please log in with Google.",
        });
    }
  passport.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: info.message });

      req.logIn(user, (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // 🔥 Store user email in session
          req.session.otpUser = { email: user.email };
          req.session.save((err) => {
              if (err) {
                  console.error("Session save error:", err);
                  return res.status(500).json({ message: "Session error" });
              }

              console.log("Session after login:", req.session);
              return res.json({ message: "Login successful", user });
          });
      });
  })(req, res, next);
} catch (error) {
  console.error("Login error:", error);
  return res.status(500).json({ message: "Internal Server Error" });
}
});


// // ✅ Logout Route

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }

      res.clearCookie("connect.sid"); // Clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });
});


//Forgot Password 
router.post("/forgot-password", async (req, res) => {
  try {
      const { email } = req.body;

      // Check if user exists
      const user = await LocalUser.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = await bcrypt.hash(otp, 12);

      // Store OTP in session
      req.session.resetOtp = hashedOTP;
      req.session.resetEmail = email;
      req.session.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiration

      // Send OTP via email
      await sendOtpEmail(email, otp);

      res.json({ message: "OTP sent to email. Verify to reset password." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// 🔹 Step 2: Verify OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
      const { otp } = req.body;

      // Check if OTP session exists
      if (!req.session.resetOtp || !req.session.resetEmail) {
          return res.status(400).json({ message: "OTP expired or invalid request." });
      }

      // Verify OTP
      const isMatch = await bcrypt.compare(otp, req.session.resetOtp);
      if (!isMatch) return res.status(400).json({ message: "Incorrect OTP" });

      // OTP is valid, allow password reset
      res.json({ message: "OTP verified. Proceed to reset password." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// 🔹 Step 3: Reset Password
router.post("/reset-password", async (req, res) => {
  try {
      const { newPassword } = req.body;

      // Check if OTP session exists
      if (!req.session.resetOtp || !req.session.resetEmail) {
          return res.status(400).json({ message: "OTP expired or invalid request." });
      }

      // Find user
      const user = await LocalUser.findOne({ email: req.session.resetEmail });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      // Clear session
      req.session.resetOtp = null;
      req.session.resetEmail = null;
      req.session.otpExpires = null;

      res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// ✅ Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


  // 🔹 Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
      console.log("✅ Google Login Successful!");
      console.log("Session after Google login:", req.session);
      console.log("User after Google login:", req.user);

      // Manually save session after authentication (for some session stores)
      req.session.save((err) => {
          if (err) {
              console.error("❌ Error saving session:", err);
              return res.status(500).json({ message: "Session save error" });
          }
          res.redirect("/auth/dashboard"); // Redirect user after successful login
      });
  }
);


router.get("/test-session", (req, res) => {
  console.log("Session Data:", req.session);
  console.log("User in session:", req.user);
  res.json({ session: req.session, user: req.user });
});

  
  router.get("/auth/failure", (req, res) => {
    res.status(401).json({ message: "Authentication failed" });
  });
  

  router.get("/dashboard", (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    res.json({ message: "Welcome to the dashboard!", user: req.user });
});

  
module.exports = router;


/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and account management
 *   - name: Admin
 *     description: Administrative operations (for testing/development)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         isVerified:
 *           type: boolean
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /delete-all-users:
 *   delete:
 *     summary: "[ADMIN] Delete all users and their associated data"
 *     tags: [Admin]
 *     description: WARNING - Deletes all users, their liked services, and search history (for testing/development)
 *     responses:
 *       200:
 *         description: All user data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All users and their associated data deleted successfully!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: OTP sent to email for verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to email. Please verify to continue."
 *       400:
 *         description: Bad request (invalid email or already registered)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified and user logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verified and logged in successfully!"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid OTP or expired session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Google account detected or invalid credentials
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out current user
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       500:
 *         description: Error logging out
 */

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent for password reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to email. Verify to reset password."
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /verify-reset-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP verified. Proceed to reset password."
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully. You can now log in."
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     description: Redirects to Google for authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to dashboard after successful login
 *       401:
 *         description: Authentication failed
 */

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: OAuth failure endpoint
 *     tags: [Authentication]
 *     responses:
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: User dashboard
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard accessed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the dashboard!"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */