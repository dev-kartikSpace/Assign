# Kanbanly 🚀

<div align="center">

![Kanbanly Logo](https://img.shields.io/badge/Kanbanly-Project%20Management-blue?style=for-the-badge&logo=trello&logoColor=white)

**A sleek, real-time Kanban board app inspired by Trello**
*Collaborate on workspaces, drag-and-drop cards, and track changes instantly*

[![Demo Demo](https://img.shields.io/badge/🚀_Try-Live_Demo-blue?style=for-the-badge&logo=vercel)](https://www.youtube.com/watch?v=cemYD8L0RNs)
[![Drag-Drop Video](https://img.shields.io/badge/🎥_Watch-Demo_Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=OMKPKcaUgqY)
[![GitHub](https://img.shields.io/badge/⭐_Star-Repository-black?style=for-the-badge&logo=github)](https://github.com/dev-kartikSpace/Mini-Trello-App)

</div>

---

## 🎥 Demo Showcase

### 📱 App Usage Demo
*Experience the intuitive interface and powerful features in action*

<div align="center">

[![App Usage Demo](https://img.youtube.com/vi/cemYD8L0RNs/maxresdefault.jpg)](https://www.youtube.com/watch?v=cemYD8L0RNs)

**👆 Click to watch the full demo**

</div>

### 👥 Real-time Collaboration Demo  
*See how teams collaborate seamlessly with instant synchronization*

<div align="center">

[![Collaboration Demo](https://img.youtube.com/vi/OMKPKcaUgqY/maxresdefault.jpg)](https://www.youtube.com/watch?v=OMKPKcaUgqY)

**👆 Click to watch collaboration in action**

</div>

---

## 📸 Visual Tour

### 🏠 Home Page
*Clean and intuitive landing page with modern design*

<div align="center">
  <img src="./client/src/assets/homePage.png" alt="Kanbanly Home Page" width="800" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

### 📋 Board Interface
*Organized board layout with drag-and-drop functionality*

<div align="center">
  <img src="./client/src/assets/board.png" alt="Kanban Board Interface" width="800" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

### 🖱️ Drag & Drop in Action
*Smooth and responsive drag-and-drop experience*

<div align="center">
  <img src="./client/src/assets/dragdrop.png" alt="Drag and Drop Feature" width="600" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

### 👥 Team Collaboration
*Real-time collaboration with multiple users*

<div align="center">
  <img src="./client/src/assets/collab.png" alt="Team Collaboration" width="600" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

---

## ✨ Key Features

<div align="center">

| 🎯 **Core Features** | 🔥 **Advanced** | 🚀 **Performance** |
|:---:|:---:|:---:|
| ✅ Drag & Drop Cards | ⚡ Real-time Sync | 🏃‍♂️ Fast Loading |
| 📋 Multiple Boards | 👥 Team Collaboration | 📱 Mobile Responsive |
| 🏷️ Card Labels | 🔔 Instant Notifications | ⚡ Socket.IO Integration |
| 📝 Rich Text Editing | 🔐 Secure Authentication | 🎨 Modern UI/UX |
| 📅 Due Dates | 📊 Activity Tracking | 🔄 Auto-save |

</div>

---

## 🛠️ Tech Stack

<div align="center">

### **Backend Powerhouse**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

### **Frontend Excellence**  
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

### 🎯 Architecture Highlights

```mermaid
graph TD
    A[React Frontend] --> B[Express API]
    B --> C[MongoDB Database]
    A --> D[Socket.IO Client]
    D --> E[Socket.IO Server]
    E --> C
    B --> F[JWT Authentication]
    A --> G[Tailwind CSS]
    E --> H[Real-time Updates]
```

**Why These Technologies?**
- **🟢 Node.js**: Unified JavaScript environment across full stack
- **⚡ Express.js**: Fast, minimalist web framework for robust APIs
- **🍃 MongoDB**: Flexible document structure perfect for dynamic Kanban data
- **🔌 Socket.IO**: Real-time bidirectional communication for instant collaboration
- **⚛️ React 18**: Modern hooks and context for efficient state management
- **🎨 Tailwind CSS**: Utility-first approach for rapid, consistent styling

---

## 🚀 Quick Start

### **Prerequisites**
- 📦 Node.js v18+ 
- 🍃 MongoDB (Local or Atlas)
- 🔧 Git
- 📝 Code Editor

### **⚡ Installation**

1. **Clone & Navigate**
   ```bash
   git clone https://github.com/dev-kartikSpace/Mini-Trello-App.git
   cd Mini-Trello-App
   ```

2. **Environment Setup**
   ```bash
   # Create environment file
   cp .env.example .env
   ```
   
   **Configure your .env:**
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/kanbanly
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Server
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Backend** 🔧
   ```bash
   cd backend
   npm run dev
   ```
   ✅ Backend running at `http://localhost:5001`

5. **Launch Frontend** ⚛️
   ```bash
   # New terminal
   cd frontend  
   npm run dev
   ```
   ✅ Frontend running at `http://localhost:5173`

6. **🎉 You're Ready!**
   Open `http://localhost:5173` and start organizing!

---

## 📁 Project Structure

```
kanbanly/
├── 🏗️ backend/                 # Server-side application
│   ├── 🎮 controllers/         # Business logic handlers
│   ├── 🛡️ middleware/          # Auth & validation
│   ├── 📊 models/              # MongoDB schemas
│   ├── 🛣️ routes/              # API endpoints
│   ├── 🔌 socket/              # Real-time handlers
│   └── 🚀 server.js            # App entry point
├── ⚛️ frontend/                # React application
│   ├── 🧩 src/components/      # Reusable components
│   ├── 📄 src/pages/           # Route components
│   ├── 🪝 src/hooks/           # Custom hooks
│   ├── 🌐 src/context/         # State management
│   └── 🎨 src/assets/          # Images & media
├── 📸 assets/                  # Project screenshots
└── 📚 docs/                    # Documentation
```

---

## 🗄️ Database Architecture

<div align="center">

```mermaid
erDiagram
    User ||--o{ Workspace : creates
    User ||--o{ Board : manages
    Workspace ||--o{ Board : contains
    Board ||--o{ Card : holds
    User ||--o{ Card : assigns
    
    User {
        ObjectId _id
        string name
        string email
        string password
        string avatar
        date createdAt
    }
    
    Workspace {
        ObjectId _id
        string title
        string description
        ObjectId owner
        array members
        date createdAt
    }
    
    Board {
        ObjectId _id
        string title
        ObjectId workspaceId
        string visibility
        array members
        date createdAt
    }
    
    Card {
        ObjectId _id
        string title
        string description
        ObjectId boardId
        string listId
        number position
        array assignees
        array labels
        date dueDate
        date createdAt
    }
```

</div>

---

## 🤝 Contributing

We love contributions! Here's how to get involved:

### **🔄 Development Workflow**
1. 🍴 Fork the repository
2. 🌿 Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 💾 Commit your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. 📤 Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. 🔄 Open a Pull Request

### **📋 Code Guidelines**
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments
- Include tests for new features
- Ensure responsive design

### **🐛 Found a Bug?**
[Create an issue](https://github.com/dev-kartikSpace/Mini-Trello-App/issues) with:
- Clear description
- Steps to reproduce
- Expected behavior
- Screenshots if applicable

---

## 📄 License

<div align="center">

**MIT License** - see the [LICENSE](LICENSE) file for details

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🙏 Acknowledgments

<div align="center">

**Made with ❤️ by the Kanbanly Team**

Special thanks to:
- 🎨 Trello for design inspiration
- 🌟 Open source community
- 🚀 Modern web technologies
- 👥 Our amazing contributors

</div>

---

## 📚 Documentation

<div align="center">

| 📖 **Resource** | 🔗 **Link** |
|:---:|:---:|
| High-Level Design | [HLD.md](./docs/HLD.md) |
| Low-Level Design | [LLD.md](./docs/LLD.md) |
| API Documentation | [API.md](./docs/API.md) |
| Contributing Guide | [CONTRIBUTING.md](./CONTRIBUTING.md) |

</div>

---

<div align="center">

### **⭐ Show Your Support**

If this project helped you, please consider giving it a star!

[![GitHub stars](https://img.shields.io/github/stars/dev-kartikSpace/Mini-Trello-App?style=social)](https://github.com/dev-kartikSpace/Mini-Trello-App/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dev-kartikSpace/Mini-Trello-App?style=social)](https://github.com/dev-kartikSpace/Mini-Trello-App/network)
[![GitHub issues](https://img.shields.io/github/issues/dev-kartikSpace/Mini-Trello-App?style=social)](https://github.com/dev-kartikSpace/Mini-Trello-App/issues)

**Ready to revolutionize your project management? Let's get started! 🚀**

</div>