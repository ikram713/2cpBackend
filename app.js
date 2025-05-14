require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cloudinary = require('./Config/cloudinary');
require("./Config/PassportConfig");


///Authentification Routes 
const AdminRoute = require('./Routes/Authentification/AdminRoute');
const AuthRoutes = require('./Routes/Authentification/AuthRoutes');

//Admin Routes 

const DeleteService = require('./Routes/Admin/DeleteService.js');
  //Adding Routes
  const AddService = require('./Routes/Admin/AddService.js');

  // //Deleting Routes
 // const DeleteService = require('./Routes/Admin/DeleteService.js');

  // //Updating Routes
  const updateRestaurant = require('./Routes/Admin/routeUpdateRestaurant.js');


  //Display
  const displayRestaurants = require('./Routes/Display/displayRestaurants.js');
  const displayCoffeeShops = require('./Routes/Display/displayCoffeeShops.js');
  const displayAdministration = require('./Routes/Display/displayAdministration.js');
  const displayPrivateSchool = require('./Routes/Display/displayPrivateSchools.js');
  const displayGrocerie = require('./Routes/Display/displayGroceries.js');
  const displayDeleiveryOffice = require('./Routes/Display/displayDeleiveryOffices.js');
  const displayMedicalAss = require('./Routes/Display/displayMedicalAss.js');


  //Edit Profile
  const editProfile = require('./Routes/Authentification/edit-profile.js');

  //pofile information
  const profileInformation = require('./Routes/Authentification/profileInformation.js');

//Rating Routes 
  const Rate = require('./Routes/Rating/Rate.js');

//Search Routes 
const DisplaySearchHistory =require('./Routes/Display/DisplaySearchHistory.js');
const SearchGlobal = require('./Routes/Search/SearchGlobalRoute.js');


//Likes Routes
const likeServiceRoutes = require('./Routes/Likes/LikeServiceRoute.js');
const likeList = require('./Routes/Display/displayLikes.js');


//Comments
const AddComment = require('./Routes/Comment/AddComment.js');
const DisplayComments = require('./Routes/Comment/DisplayComments.js');
const DeleteComment = require('./Routes/Comment/DeleteComment.js');
const UpdateComment = require('./Routes/Comment/UpdateComment.js');
const LikeComment = require('./Routes/Comment/LikeComment.js');

//Map
const gomap = require('./Routes/Map/GoMap.js');

//Suggestions 
const Suggestions = require('./Routes/Suggestions/suggestion.js');

// Convert data into JSON format
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  //we must add it or req.body become undefined

// ✅ Global Session Middleware
const storeSession = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName : "sessions",
  });
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store:storeSession,
      cookie: {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: false, // Set to true if using HTTPS
        sameSite: "lax", // Prevent CSRF attacks
        maxAge: 1000 * 60 * 60 * 24, // Session expiration time (e.g., 1 day)
      },
    })
  );

  // ✅ Initialize Passport globally
    app.use(passport.initialize());
    app.use(passport.session());
    
   //Cookies 
    const cors = require("cors");

    app.use(
      cors({
        origin: "http://localhost:3000", // Update this to your frontend URL
        credentials: true, // Allow cookies to be sent
      })
    );
    
//using routers
app.use('/auth',AuthRoutes);




app.use('/',Rate);



//Edit profile
app.use('/',editProfile)



//profile information
app.use('/',profileInformation);

// Admin routes
app.use('/admin',AdminRoute);
app.use('/admin',AddService);
app.use('/admin',DeleteService);
app.use('/admin',updateRestaurant);

//Display Routes
app.use('/',DisplaySearchHistory);
app.use('/',SearchGlobal);
app.use('/',displayRestaurants);
app.use('/',displayCoffeeShops);
app.use('/',displayMedicalAss);
app.use('/',displayAdministration);
app.use('/',displayGrocerie);
app.use('/',displayPrivateSchool);
app.use('/',displayDeleiveryOffice);


//Likes Routes
app.use('/', likeServiceRoutes);
app.use('/', likeList);


//Comments Routes
app.use('/', AddComment);
app.use('/', DisplayComments);
app.use('/', DeleteComment);
app.use('/', UpdateComment);
app.use('/', LikeComment);


app.use('/', gomap);

app.use('/', Suggestions);

const setupSwagger = require('./doc'); // Import your swagger config
setupSwagger(app); 
// Connect to the database
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connection to database successful'))
    .catch((err) => console.error('Database connection failed:', err));



 // Start the Server
app.listen(process.env.PORT, () => console.log('App running successfully on port 3000')); 

    