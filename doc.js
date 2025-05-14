// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Your API Documentation",
    version: "1.0.0",
    description: "API documentation for your application",
    contact: {
      name: "Your Name",
      email: "support@yourapi.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000", // Update with your backend URL
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {  // If using session cookies
        type: "apiKey",
        in: "cookie",
        name: "connect.sid", // Must match your cookie name
      },
      bearerAuth: {  // If using JWT
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      cookieAuth: [], // Apply globally (if using cookies)
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ["./Routes/Comment/*.js","./Routes/Authentification/*.js","./Routes/Admin/*.js","./Routes/Display/*.js","./Routes/Likes/*.js","./Routes/Map/*.js","./Routes/Rating/*.js","./Routes/Search/*.js","./Routes/Suggestions/*.js"], // Path to your API routes
};

const swaggerSpec = swaggerJSDoc(options);

// Setup Swagger middleware
function setupSwagger(app) {
  // Swagger UI page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Docs in JSON format (optional)
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}


module.exports = setupSwagger;
