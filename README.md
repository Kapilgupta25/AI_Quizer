# AI_Quizer

AI_Quizer is a full-stack multiplayer quiz platform that generates topic-based quizzes with AI and lets players compete in real time. Users can create quiz rooms, invite others with a room code, answer synchronized questions live, and track rankings on a live leaderboard.

## Live Demo

Deployment Link: https://ai-quizer-g14x.onrender.com/

## Overview

AI_Quizer combines a modern React frontend with an Express and Socket.IO backend to deliver a fast, interactive quiz experience. Quiz questions are generated dynamically using Google Gemini, authentication supports both email/password and Google Sign-In, and live room activity is handled with WebSockets for smooth multiplayer gameplay.

## Key Features

- AI-generated quiz questions based on user-selected topics
- Real-time multiplayer quiz rooms with live updates
- Room creation and join flow using room codes
- Configurable difficulty, question count, and time limit
- Live leaderboard and scoring system
- User authentication with email/password and Google Sign-In
- Responsive frontend built with React and Tailwind CSS
- Backend API with Express, MongoDB, and Socket.IO

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Socket.IO
- Google Gemini API
- Google OAuth
- Redis / Upstash Redis (optional but supported)

## Project Structure

```text
AI_quizer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
└── README.md
```

## Requirements

Before running the project on another system, make sure the following tools are installed:

- Node.js 18 or later
- npm 9 or later
- Git
- MongoDB Atlas account or local MongoDB instance
- Google AI Studio / Gemini API key
- Google Cloud OAuth client for web sign-in
- Redis instance if you want caching support

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/AI_Quizer.git
cd AI_Quizer
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Note: You do not need to install individual package dependencies manually. Running `npm install` in both `backend` and `frontend` will install everything listed in each `package.json`.

## Environment Variables

Create the following environment files before running the project.

### Backend

Create `backend/src/.env` with values like:

```env
MONGODB_URI=your_mongodb_connection_string
PASSWORD_PEPPER=your_password_pepper
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLIENT_URL=http://localhost:5173
PORT=5000
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=development
```

### Frontend

Create `frontend/.env` with:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## How To Run The Project

Open the project in your code editor, then start the backend and frontend in separate terminals.

### Start the backend

```bash
cd backend
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Open the frontend URL in your browser to use the app.

## Running On Another User's System

If another user wants to run this project locally, they should:

1. Install Node.js, npm, and Git.
2. Clone the repository.
3. Run `npm install` inside `backend`.
4. Run `npm install` inside `frontend`.
5. Create the required `.env` files with valid credentials.
6. Start the backend with `npm run dev`.
7. Start the frontend with `npm run dev`.
8. Open `http://localhost:5173` in the browser.

## Available Scripts

### Frontend

- `npm run dev` - starts the Vite development server
- `npm run build` - creates a production build
- `npm run preview` - previews the production build locally

### Backend

- `npm run dev` - starts the backend with Nodemon
- `npm start` - starts the backend in normal mode

## Deployment Notes

For production deployment:

- Deploy the frontend to a platform like Vercel or Netlify
- Deploy the backend to a platform like Render, Railway, or a VPS
- Use a hosted MongoDB database such as MongoDB Atlas
- Configure production environment variables on both frontend and backend
- Update `CLIENT_URL` on the backend to your deployed frontend URL
- Add your deployed frontend domain to Google OAuth Authorized JavaScript Origins

## Google OAuth Setup

If you are using Google Sign-In, make sure your Google Cloud OAuth client is configured correctly.

Add these under Authorized JavaScript Origins during local development:

- `http://localhost:5173`
- `http://localhost`

For production, also add your deployed frontend domain.

## Real-Time Multiplayer Flow

The application uses Socket.IO to:

- join rooms in real time
- broadcast participant activity
- sync quiz questions across players
- submit answers instantly
- update scores and the leaderboard live

## AI Quiz Generation

Quiz content is generated on the backend using Google Gemini. The quiz generation flow supports:

- topic-based prompt generation
- difficulty-based question generation
- exact question count control
- structured JSON validation before gameplay

## Security Notes

- Never commit real `.env` values to GitHub
- Use strong JWT secrets in production
- Rotate credentials before public deployment if any sensitive values were exposed locally
- Restrict Google OAuth origins and API keys to trusted domains only

## Future Improvements

- Add admin analytics and quiz history
- Add category presets and saved quizzes
- Add player avatars and profile settings
- Add stronger production logging and monitoring
- Add automated tests and CI workflows

## Author

Developed by Kapil.

