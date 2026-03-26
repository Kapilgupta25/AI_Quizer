import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { disconnectSocket } from '../../services/socket.js';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, isAuthenticated, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (_) {}
    disconnectSocket();
    logout();
    navigate('/');
    toast.success('Logged out');
  };


  return (
    
    <div className="min-h-dvh flex flex-col bg-surface-900 bg-grid-pattern">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-surface-900/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-sm">
              Q
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              AI<span className="text-brand-400">Quizer</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-secondary py-2 px-4 text-xs">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-300 font-display font-semibold text-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white/70 hidden sm:block">{user?.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2 px-4 text-xs">Sign in</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-xs">Get started</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
