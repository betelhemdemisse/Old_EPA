const express = require("express");
const cors = require("cors");
const fs = require("fs");
const http = require('http');
const path = require("path");
require("dotenv").config();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { Server } = require("socket.io");
const db = require("./models");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },  
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

function sendRealtimeNotification(userId, data) {
  io.to(`user_${userId}`).emit("status_update", data);
   console.log(`Notification sent to user ${userId}:`, data);
}

// Import routes
const cityRoutes = require("./routes/city.routes");
const regionRoutes = require("./routes/region.routes");
const zoneRoutes = require("./routes/zone.routes");
const chatRoutes = require("./routes/chat.routes");
const generalDashboardRoutes = require("./routes/generalDashboard.routes");
const woredaRoutes = require("./routes/wereda.routes");
const subcityRoutes = require("./routes/subcity.routes");
const customerAccountRoutes = require("./routes/customerAccount.routes");
const roleRoutes = require("./routes/role.routes");
const regionWorkFlow = require("./routes/regional-workflow.routes");
const authRoutes = require("./routes/auth.routes");
const pollutionRoutes = require("./routes/pollutionCategory.routes");
const subPollutionRoutes = require("./routes/subPollutionCategory.routes");
const departmentRoutes = require("./routes/department.routes");
const penalityRoutes = require("./routes/penalty.routes");
const compaintRoutes = require("./routes/complaint.routes");
const teamRoutes = require('./routes/team.routes');
const administratorRoutes = require('./routes/adminstratorAccount.routes');
const complaintWorkflowRoutes = require('./routes/complaintWorkflow.route');
const teamscaseRoutes = require('./routes/teamscase.routes');
const organizationHierarchyRoutes = require('./routes/organizationHierarchy.route');
const caseRoutes = require('./routes/case.routes');
const epaOfficeLocationRoutes = require('./routes/epaOfficeLocation.routes');
const awarenessRoutes = require("./routes/awarenessRoutes");
const newsRoutes = require("./routes/news.routes");
const guestRoutes = require("./routes/guest.routes");
const generalReports = require("./routes/report.routes");
const permissionRoutes = require('./routes/permission.routes');
const soundAreaRoutes = require("./routes/soundArea.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const formtype = require('./routes/formtype.route');
const reporttype = require('./routes/reporttype.route');
const reportform = require('./routes/reportform.route');
const rejectionReason = require('./routes/rejectionReasonRoutes');
const regionalTeamCaseRoutes = require("./routes/regionalTeamCase.routes");
// ✅ DON'T import reportSubmissionRoutes here - it will be auto-loaded

// ==================== MIDDLEWARE SETUP ====================

// CORS configuration
const allowedOrigins = ['*'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*')) {
          return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
          return callback(null, true);
      }

      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FILE SERVING ====================
// Serve static files from 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== BASIC ROUTES ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to Clean Ethiopia API",
    version: "1.0.0",
    endpoints: {
      apiDocs: "/api-docs",
      staticFiles: "/public/..."
    }
  });
});

// Test endpoint for static files
app.get("/test-file", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'complaint', '1765910621883-750539917-sample_trash.jpeg');
  
  if (fs.existsSync(filePath)) {
    res.json({
      message: "File exists on server",
      path: filePath,
      url: `http://${req.headers.host}/public/complaint/1765910621883-750539917-sample_trash.jpeg`,
      accessible: true
    });
  } else {
    res.status(404).json({
      message: "File not found on server",
      path: filePath,
      accessible: false
    });
  }
});

// ==================== SWAGGER DOCUMENTATION ====================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clean Ethiopia API",
      version: "1.0.0",
      description:
        "REST API documentation for the Clean Ethiopia project. Includes Cities, Regions, Zones, Woredas, Subcities, Pollution Categories, Departments, Penalties, and Complaints.",
      contact: { name: "Clean Ethiopia Dev Team" },
    },
    servers: [
      {
        url: "/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==================== AUTO-LOAD ROUTES ====================
const apiPrefix = "/api";
const routesPath = path.join(__dirname, "routes");

// Function to safely load routes
const loadRoute = (filePath) => {
  try {
    const route = require(filePath);
    return route;
  } catch (error) {
    console.error(`❌ Failed to load route ${filePath}:`, error.message);
    return null;
  }
};

// Auto-load routes that don't have issues
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith(".routes.js")) {
    const filePath = path.join(routesPath, file);
    const routeName = file.replace(".routes.js", "").replace(/_/g, "-");
    
    // Skip reportSubmission.route.js if it has issues - we'll handle it manually
    if (file === "reportSubmission.route.js") {
      console.log(`⚠️  Skipping ${file} for now - will handle manually`);
      return;
    }
    
    const route = loadRoute(filePath);
    if (route) {
      app.use(`${apiPrefix}/${routeName}`, route);
    }
  }
});

// ==================== MANUAL ROUTE REGISTRATION ====================
// Register routes manually to handle errors gracefully
app.use("/api/regions", regionRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/woredas", woredaRoutes);
app.use("/api/subcities", subcityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/customer-accounts", customerAccountRoutes);
app.use("/api/pollution-categories", pollutionRoutes);
app.use("/api/sub-pollution-categories", subPollutionRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/penalties", penalityRoutes);
app.use("/api/complaints", compaintRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/administrator", administratorRoutes);
app.use("/api/organization-hierarchy", organizationHierarchyRoutes);
app.use("/api/teams-cases", teamscaseRoutes);
app.use("/api/regional-workflow", regionWorkFlow);
app.use("/api/case", caseRoutes);
app.use("/api/penality-sub-category", require("./routes/penalitySubCategory"));
app.use("/api/complaint-workflow", complaintWorkflowRoutes);
app.use("/api/sound-areas", soundAreaRoutes);
app.use("/api/users", authRoutes);        // for /me
app.use("/api/auth", authRoutes);         // for /change-password
app.use("/api/regional-team-case", regionalTeamCaseRoutes);
try {
  const reportSubmissionRoutes = require("./routes/reportSubmission.route");
  app.use("/api/report-submit", reportSubmissionRoutes);
  console.log("✅ Successfully loaded report-submit route");
} catch (error) {
  console.error("❌ Failed to load report-submit route:", error.message);
  console.log("⚠️  report-submit endpoints will not be available");
}
app.use("/api/guest", guestRoutes);
app.use("/api/epa-office-locations", epaOfficeLocationRoutes);
app.use("/api/awareness", awarenessRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/form-type", formtype);
app.use("/api/report-type", reporttype);
app.use("/api/reporting-form", reportform);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/rejection-reasons", rejectionReason);
app.use("/api/general-reports", generalReports);
app.use("/api/general-dashboard", generalDashboardRoutes);



// ==================== ERROR HANDLING ====================
// 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({ 
    message: "Route not found",
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  const status = err.status || 500;
  res.status(status).json({ 
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://192.168.220.61:${PORT}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`📁 Static Files: http://localhost:${PORT}/public/`);
  console.log(`🔍 Test File: http://localhost:${PORT}/test-file`);
  console.log(`=========================================`);
});

module.exports = { sendRealtimeNotification, io };