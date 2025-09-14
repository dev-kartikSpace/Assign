# Kanbanly Design Document 🚀

## High-Level Design (HLD)

### 1. Architecture Diagram

```
┌─────────────────┐    HTTP/WS    ┌─────────────────┐    MongoDB    ┌─────────────────┐
│   React Client  │◄─────────────►│  Express.js API │◄─────────────►│   MongoDB       │
│                 │               │                 │               │                 │
│ • Auth Context  │               │ • JWT Auth      │               │ • Users         │
│ • Socket Client │               │ • Socket.IO     │               │ • Workspaces    │
│ • Drag & Drop   │               │ • REST Routes   │               │ • Boards        │
│ • Real-time UI  │               │ • Controllers   │               │ • Cards         │
└─────────────────┘               └─────────────────┘               │ • ChangeLogs    │
                                                                    └─────────────────┘
```

### 2. Major Components

#### Frontend (React)
- **AuthContext**: JWT token management, login/logout
- **SocketContext**: Real-time connection management  
- **BoardManager**: Board CRUD operations
- **DragDropSystem**: @dnd-kit integration for card movement
- **UIComponents**: Reusable components (Card, List, Modal)

#### Backend (Express.js)
- **AuthMiddleware**: JWT validation, route protection
- **SocketServer**: Real-time event handling (Socket.IO)
- **Controllers**: Business logic (auth, workspace, board, card)
- **Models**: Mongoose schemas and validation
- **Routes**: API endpoint definitions

### 3. Data Flow

```
User Action → Frontend State → API Call → Database → Socket Event → All Clients
```

**Example - Card Move:**
1. User drags card → Local optimistic update
2. API call to `/cards/:id/move` 
3. Database update with new position
4. Socket broadcast `card-moved` event
5. Other clients receive event → Update UI

### 4. Real-time Choice: WebSocket (Socket.IO)

**Why WebSocket over SSE:**
- **Bidirectional**: Client can send events (typing, presence)
- **Low Latency**: Critical for drag-and-drop UX
- **Connection Management**: Automatic reconnection, rooms
- **Fallback Support**: Works across all browsers/networks

**Key Events:**
```javascript
// Client → Server
'join-board', 'card-move', 'card-update', 'typing'

// Server → Clients  
'card-moved', 'card-updated', 'user-joined', 'sync-state'
```

### 5. Deployment Sketch

```
Frontend (Vercel) → CDN → Load Balancer → Backend (Heroku/AWS)
                                              ↓
                                         MongoDB Atlas
                                              ↓
                                        Redis (Sessions)
```

---

## Low-Level Design (LLD)

### 1. API Definitions

#### Authentication
```yaml
POST /auth/register
POST /auth/login     
POST /auth/refresh
POST /auth/logout
```

#### Core Resources
```yaml
# Workspaces
GET    /workspaces
POST   /workspaces
GET    /workspaces/:id
PUT    /workspaces/:id
DELETE /workspaces/:id
POST   /workspaces/:id/members

# Boards  
GET    /boards?workspaceId=:id
POST   /boards
GET    /boards/:id
PUT    /boards/:id
DELETE /boards/:id

# Cards
POST   /cards
GET    /cards/:id  
PUT    /cards/:id
DELETE /cards/:id
PUT    /cards/:id/move
```

#### Request/Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response  
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { "field": "title is required" }
  }
}
```

### 2. Main Classes/Modules

#### Backend Structure
```
backend/
├── controllers/
│   ├── authController.js      # Login, register, JWT handling
│   ├── workspaceController.js # Workspace CRUD
│   ├── boardController.js     # Board operations
│   └── cardController.js      # Card CRUD, move operations
├── models/
│   ├── User.js               # User schema
│   ├── Workspace.js          # Workspace schema  
│   ├── Board.js              # Board schema
│   ├── Card.js               # Card schema
│   └── ChangeLog.js          # Activity tracking
├── middleware/
│   ├── auth.js               # JWT validation
│   ├── validation.js         # Request validation
│   └── errorHandler.js       # Global error handling
├── routes/
│   └── index.js              # Route definitions
└── socket/
    └── socketHandlers.js     # Real-time event handlers
```

#### Frontend Structure  
```
frontend/src/
├── components/
│   ├── Board/                # Board UI components
│   ├── Card/                 # Card components
│   ├── Auth/                 # Login/Register forms
│   └── shared/               # Reusable components
├── contexts/
│   ├── AuthContext.js        # Authentication state
│   └── SocketContext.js      # Socket connection
├── hooks/
│   ├── useAuth.js            # Authentication hook
│   ├── useSocket.js          # Socket operations
│   └── useApi.js             # API calls
├── pages/
│   ├── Dashboard.js          # Main workspace view
│   ├── Board.js              # Board detail view
│   └── Login.js              # Authentication page
└── utils/
    ├── api.js                # API client setup
    └── constants.js          # App constants
```

### 3. Database Schema

#### MongoDB Collections

```javascript
// User Collection
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}

// Workspace Collection  
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId (User),
  members: [{
    userId: ObjectId (User),
    role: String (enum: ['admin', 'member']),
    joinedAt: Date
  }],
  isPrivate: Boolean,
  createdAt: Date
}

// Board Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  workspaceId: ObjectId (Workspace),
  visibility: String (enum: ['private', 'workspace', 'public']),
  background: {
    type: String (enum: ['color', 'image']),
    value: String
  },
  lists: [{
    _id: ObjectId,
    title: String,
    position: Number,
    cards: [ObjectId] (Card references)
  }],
  members: [ObjectId] (User),
  createdAt: Date
}

// Card Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  boardId: ObjectId (Board),
  listId: ObjectId,
  position: Number,
  assignees: [ObjectId] (User),
  labels: [String],
  dueDate: Date,
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}

// ChangeLog Collection
{
  _id: ObjectId,
  workspaceId: ObjectId (Workspace),
  action: String,
  entityType: String (enum: ['board', 'card', 'list']),
  entityId: ObjectId,
  changes: Object,
  user: ObjectId (User),
  timestamp: Date
}
```

#### Entity Relationships
```
User (1) ←→ (N) Workspace ←→ (N) Board ←→ (N) Card
     ↓                                      ↑
     └──────── ChangeLog ←──────────────────┘
```

### 4. Indexing & Ordering Strategy

#### Database Indexes
```javascript
// Performance-critical indexes
db.workspaces.createIndex({ "owner": 1, "members.userId": 1 })
db.boards.createIndex({ "workspaceId": 1, "members": 1 })  
db.cards.createIndex({ "boardId": 1, "listId": 1, "position": 1 })
db.changelogs.createIndex({ "workspaceId": 1, "timestamp": -1 })

// Unique indexes
db.users.createIndex({ "email": 1 }, { unique: true })
```

#### Ordering Strategy
- **Cards**: Ordered by `position` field (decimal for easy reordering)
- **Lists**: Ordered by `position` within board
- **Activity**: Ordered by `timestamp` (descending for recent-first)

#### Position Calculation
```javascript
// Insert between positions
const newPosition = (prevPosition + nextPosition) / 2;

// Rebalancing when positions get too close
if (Math.abs(newPosition - prevPosition) < 0.00001) {
  // Rebalance all positions in the list
  rebalancePositions(listId);
}
```

### 5. Error Model

#### Error Types & HTTP Codes
```javascript
const ErrorTypes = {
  VALIDATION_ERROR: { code: 400, message: 'Invalid input data' },
  UNAUTHORIZED: { code: 401, message: 'Authentication required' },
  FORBIDDEN: { code: 403, message: 'Access denied' },
  NOT_FOUND: { code: 404, message: 'Resource not found' },
  CONFLICT: { code: 409, message: 'Resource already exists' },
  SERVER_ERROR: { code: 500, message: 'Internal server error' }
};
```

#### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };
  
  res.status(err.statusCode || 500).json(errorResponse);
};
```

#### Validation Schema Example
```javascript
const cardValidation = {
  title: { required: true, minLength: 1, maxLength: 200 },
  description: { maxLength: 2000 },
  listId: { required: true, isMongoId: true },
  position: { type: 'number', min: 0 }
};
```

---

## Technology Stack Summary

**Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO, JWT, bcrypt
**Frontend**: React, React Router, @dnd-kit, Tailwind CSS, Socket.IO-client
**Real-time**: WebSocket (Socket.IO) for bidirectional communication
**Database**: MongoDB with strategic indexing for performance
**Deployment**: Frontend (Vercel), Backend (Heroku/AWS), Database (MongoDB Atlas)