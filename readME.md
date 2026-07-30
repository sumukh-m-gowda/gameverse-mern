# GameVerse – Online Gaming Platform

GameVerse is a full-stack web application that provides an online gaming platform where users can create accounts, explore games, track their progress, participate in tournaments, and compete on leaderboards. The project follows a modern client-server architecture using React for the frontend and Node.js with Express and MongoDB for the backend.

## Features

### User Management
- User registration and login
- Secure authentication
- User profile management
- Session handling

### Game Management
- Browse available games
- View game details
- Track gameplay progress
- Save user achievements

### Tournament System
- Create and manage tournaments
- Register players
- Track tournament progress
- View tournament information

### Leaderboards
- Global leaderboard
- Player rankings
- Score tracking
- Performance statistics

### Security Features
- JWT Authentication
- Password encryption using bcrypt
- Rate limiting
- Input validation
- CORS protection
- Error handling middleware

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- HTML5
- CSS3
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js

### Additional Tools
- Cloudinary (Image Storage)
- Nodemon
- dotenv
- CORS
- Express Middleware

## Project Structure

```
GameVerse/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── logs/
│   ├── app.js
│   └── package.json
│
└── README.md
```

## Database Models

The application uses MongoDB with Mongoose models for:

- User
- Game
- Tournament
- Leaderboard
- Game Progress
- Session

## Backend Modules

### Controllers
- Authentication Controller
- User Controller
- Game Controller
- Tournament Controller
- Progress Controller

### Middleware
- Authentication
- Error Handling
- Logger
- Rate Limiter
- Validation

### Configuration
- Database Connection
- Cloudinary Configuration
- Environment Variables
- CORS Configuration

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/gameverse.git
cd gameverse
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and configure the required environment variables.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically run on:

```
http://localhost:5173
```

The backend will run on:

```
http://localhost:5000
```

## API Features

- User Authentication
- User Management
- Game Management
- Tournament APIs
- Progress Tracking
- Leaderboard APIs

## Security

- JWT-based authentication
- Encrypted passwords
- Request validation
- Protected routes
- Rate limiting
- Secure API middleware

## Future Improvements

- Multiplayer support
- Real-time gameplay using Socket.io
- Friend system
- Chat functionality
- Notifications
- Achievement badges
- Game recommendations
- Payment gateway integration
- Admin dashboard
- Dark mode
- Mobile responsive improvements

## Learning Outcomes

- MERN Stack Development
- REST API Design
- MongoDB Database Modeling
- Authentication and Authorization
- React Component Architecture
- Backend Middleware
- CRUD Operations
- MVC Architecture
- Environment Configuration
- Full-Stack Application Development

## Author

Developed as a Web Technologies Mini Project using the MERN Stack.
