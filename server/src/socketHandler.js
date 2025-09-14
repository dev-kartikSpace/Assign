const jwt = require("jsonwebtoken");
const Board = require("./models/Board");
const Workspace = require("./models/Workspace");
const User = require("./models/User");
const Card = require("./models/Card");
const Comment = require("./models/Comment");
const ChangeLog = require("./models/changeLog");

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

        socket.on("card_moved", async ({ cardId, newBoardId, newPosition, workspaceId }) => {
          console.log("Received card_moved:", { cardId, newBoardId, newPosition }); // Debug log
          const card = await Card.findById(cardId);
          if (card && socket.user._id.equals(card.createdBy)) {
            card.boardId = newBoardId;
            card.position = newPosition;
            await card.save();

            // Log card movement
            await new ChangeLog({
              workspaceId,
              action: 'card_moved',
              title: card.title,
              fromBoardId: card.boardId, // Previous boardId (before save)
              toBoardId: newBoardId,
              userId: socket.user._id,
              timestamp: new Date(),
            }).save();

            io.to(`workspace:${workspaceId}`).emit("card_moved", {
              cardId,
              newBoardId,
              newPosition,
            });
          }
        });

        socket.on("card_created", async ({ card, workspaceId }) => {
          if (!card._id) return;
          // Log card creation (assuming card is saved elsewhere)
          await new ChangeLog({
            workspaceId,
            action: 'card_created',
            title: card.title,
            boardId: card.boardId,
            userId: socket.user._id,
            timestamp: new Date(),
          }).save();

          io.to(`workspace:${workspaceId}`).emit("card_created", { card });
        });

        socket.on("card_deleted", async ({ cardId, workspaceId }) => {
          const card = await Card.findById(cardId);
          if (card && socket.user._id.equals(card.createdBy)) {
            await Card.deleteOne({ _id: cardId });

            // Log card deletion
            await new ChangeLog({
              workspaceId,
              action: 'card_deleted',
              title: card.title,
              boardId: card.boardId,
              userId: socket.user._id,
              timestamp: new Date(),
            }).save();

            io.to(`workspace:${workspaceId}`).emit("card_deleted", { cardId });
          }
        });

        socket.on("board_created", async ({ board, workspaceId }) => {
          // Log board creation (assuming board is saved elsewhere)
          await new ChangeLog({
            workspaceId,
            action: 'board_created',
            title: board.title,
            userId: socket.user._id,
            timestamp: new Date(),
          }).save();

          io.to(`workspace:${workspaceId}`).emit("board_created", { board });
        });

        socket.on("board_deleted", async ({ boardId, workspaceId }) => {
          const board = await Board.findById(boardId);
          if (board && socket.user._id.equals(board.createdBy)) {
            await Board.deleteOne({ _id: boardId });

            // Log board deletion
            await new ChangeLog({
              workspaceId,
              action: 'board_deleted',
              title: board.title,
              userId: socket.user._id,
              timestamp: new Date(),
            }).save();

            io.to(`workspace:${workspaceId}`).emit("board_deleted", { boardId });
          }
        });

        socket.on("user_invited", async ({ userId, workspaceId }) => {
          // This event is typically handled by the inviteUser endpoint, so no additional log here
          io.to(`workspace:${workspaceId}`).emit("user_invited", { userId });
        });
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