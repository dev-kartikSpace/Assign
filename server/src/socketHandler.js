const jwt = require("jsonwebtoken");
const Board = require("./models/Board");
const Workspace = require("./models/Workspace");
const User = require("./models/User");
const Card = require("./models/Card");
const Comment = require("./models/Comment");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("authenticate", async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
          socket.emit("error", { message: "Invalid token", code: 401 });
          socket.disconnect();
          return;
        }
        socket.user = user;

        const workspaces = await Workspace.find({ "members.userId": user._id });
        workspaces.forEach((workspace) => {
          socket.join(`workspace:${workspace._id}`);
          console.log(`User ${user._id} joined workspace:${workspace._id}`);
        });

        socket.on("join_workspace", async (workspaceId) => {
          const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.userId": user._id,
          });
          if (!workspace) {
            socket.emit("error", {
              message: "Access denied to workspace",
              code: 403,
            });
            return;
          }
          socket.join(`workspace:${workspaceId}`);
          console.log(`User ${user._id} joined workspace:${workspaceId}`);
          const boards = await Board.find({ workspaceId });
          const cards = await Card.find({
            boardId: { $in: boards.map((b) => b._id) },
          }).sort({ position: 1 });
          socket.emit("initial_state", { boards, cards });
        });

        socket.on("card_moved", async ({ cardId, newBoardId, newPosition }) => {
          console.log("Received card_moved:", { cardId, newBoardId, newPosition }); // Debug log
          const card = await Card.findById(cardId);
          if (card && socket.user._id.equals(card.createdBy)) {
            const workspaceId = (await Board.findById(newBoardId)).workspaceId;
            io.to(`workspace:${workspaceId}`).emit("card_moved", {
              cardId,
              newBoardId,
              newPosition,
            });
          }
        });

        // ... (other event handlers remain unchanged)
      } catch (err) {
        socket.emit("error", { message: "Authentication failed", code: 401 });
        socket.disconnect();
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};