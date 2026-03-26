import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import LobbyPage from './pages/LobbyPage';
import QuizPage from './pages/QuizPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1d2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#4d77ff', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="create" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
          <Route path="join" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
          <Route path="room/:code" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
          <Route path="quiz/:code" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="results/:code" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
