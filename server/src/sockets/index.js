function socketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('joinWorkspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on('boardUpdated', ({ workspaceId, boards }) => {
      io.to(`workspace:${workspaceId}`).emit('boards', boards);
    });

    socket.on('cardMoved', ({ workspaceId, payload }) => {
      io.to(`workspace:${workspaceId}`).emit('cardMoved', payload);
    });

    socket.on('commentAdded', ({ workspaceId, payload }) => {
      io.to(`workspace:${workspaceId}`).emit('commentAdded', payload);
    });
  });
}

module.exports = socketHandlers;

