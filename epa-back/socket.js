let io = null;

function initializeSocket(server) {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", socket => {
    console.log("Client connected:", socket.id);

    socket.on("join_room", userId => {
      socket.join(`user_${userId}`);
    });
  });

  return io;
}

function sendRealtimeNotification(userId, data) {
  if (!io) {
    console.log("Socket not initialized");
    return;
  }

  io.to(`user_${userId}`).emit("status_update", data);
}

module.exports = {
  initializeSocket,
  sendRealtimeNotification
};
