require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const socketIo = require("socket.io");
const connection = require("./database");
const userRoutes = require("./routes/students");
const authRoutes = require("./routes/auth");
const create_profileRoutes = require("./routes/create_profile");
const interestsRoutes = require("./routes/interests");
const eventRoutes = require("./routes/events");
const profileRoutes = require("./routes/profile");
const changePasswordRoutes = require("./routes/changePassword");
const matchingRoutes = require("./routes/matching");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Database connection
connection();

// Create Express app
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your client URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
}); // Integrate Socket.IO with HTTP server

// Middlewares
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Replace with your client URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/students", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/create_profile", create_profileRoutes);
app.use("/api/interests", interestsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/change-password", changePasswordRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Socket.IO integration
io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle incoming message event
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);
        
        // Broadcast the message to all connected clients
        io.emit('receiveMessage', message);

        // Optionally, save the message to a database or perform other actions
    });

    // Handle other events as needed
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Listening on port ${port}...`));
