const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const socketHandlers = require('./sockets/index');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } });
app.set('io', io);
const PORT = process.env.PORT || 5001;

// DB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/lists', require('./routes/listRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

const UID = () => Math.random().toString(36).substring(2, 10);

const tasks = {
  pending: {
    title: 'pending',
    items: [
      {
        id: UID(),
        title: 'Send the Figma file to Dima',
        comments: [],
      },
    ],
  },
  ongoing: {
    title: 'ongoing',
    items: [
      {
        id: UID(),
        title: 'Review GitHub issues',
        comments: [
          {
            name: 'David',
            text: 'Ensure you review before merging',
            id: UID(),
          },
        ],
      },
    ],
  },
  completed: {
    title: 'completed',
    items: [
      {
        id: UID(),
        title: 'Create technical contents',
        comments: [
          {
            name: 'Dima',
            text: 'Make sure you check the requirements',
            id: UID(),
          },
        ],
      },
    ],
  },
};

// API endpoint to fetch tasks
app.get('/api', (req, res) => {
  res.json(tasks);
});

// Socket.IO handlers
socketHandlers(io);

// Errors
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const socketHandlers = require('./sockets/index');
// const config = require('./config/config');
// const errorHandler = require('./middleware/error');

// const app = express();
// app.use(errorHandler); // Add at the end of middleware chain
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: 'http://localhost:5173' },
// });

// const PORT = 5001;

// // Connect DB
// connectDB();

// // Middleware
// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use(express.json());

// // Make io available to controllers
// app.set('io', io);

// // Routes
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/workspaces', require('./routes/workspaceRoutes'));
// app.use('/api/boards', require('./routes/boardRoutes'));
// app.use('/api/lists', require('./routes/listRoutes'));
// app.use('/api/cards', require('./routes/cardRoutes'));
// app.use('/api/comments', require('./routes/commentRoutes'));

// // Legacy /api for basic tasks
// app.get('/api', (req, res) => {
//   res.json({ message: 'Use /api/boards/:id for tasks' });
// });

// // Socket.IO
// socketHandlers(io);

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


