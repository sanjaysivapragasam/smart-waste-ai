import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;

//creates a base http server (required by socket.io)
const httpServer = createServer();

//wrap the http server with socket.io (web socket server)
const io = new Server(httpServer, {
  // configure CORS (Cross-Origin Resource Sharing) for Next.js frontend (only accepts requests from there)
  cors: {
    origin: "*", // any client can connect safely, replace with deployed Next.js frontend URL (future update) for security
    methods: ["GET", "POST"],
  },
});

//handles incoming socket connections from client(s) (page.js)
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
    // forward any data received from microservice to connected client(s)
    socket.on("update", (data) => {
      console.log("Received from microservice:", data);
      io.emit("update", data); // broadcast to all clients including frontend
    });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    //clearInterval(interval);
  });
});

//start the http server on port 4000
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Export io for future Flask/Next.js integration
export { io };