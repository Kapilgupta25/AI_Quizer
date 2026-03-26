import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SiteFooter from '../components/layout/SiteFooter.jsx';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-3xl font-display font-bold mb-1">
            Hey, {user?.name?.split(' ')[0] || 'Player'}
          </h1>
          <p className="text-white/50">Ready to quiz?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/create"
            className="card p-8 flex flex-col gap-4 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.05s', opacity: 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-sm font-display font-bold text-brand-300 group-hover:scale-110 transition-transform">
              NEW
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">Create a Room</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Pick a topic, difficulty, and question count. AI generates questions instantly.
              </p>
            </div>
            <div className="flex items-center gap-1 text-brand-400 text-sm font-display font-semibold mt-auto">
              Create room <span aria-hidden="true">-&gt;</span>
            </div>
          </Link>

          <Link
            to="/join"
            className="card p-8 flex flex-col gap-4 hover:border-accent-500/40 hover:bg-accent-500/5 transition-all group cursor-pointer animate-slide-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center text-sm font-display font-bold text-accent-300 group-hover:scale-110 transition-transform">
              JOIN
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">Join a Room</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Enter a 6-character room code to join a friend's quiz battle.
              </p>
            </div>
            <div className="flex items-center gap-1 text-accent-400 text-sm font-display font-semibold mt-auto">
              Join room <span aria-hidden="true">-&gt;</span>
            </div>
          </Link>
        </div>

        <div className="mt-6 card p-6 animate-slide-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          <h3 className="font-display font-semibold text-sm text-white/50 uppercase tracking-widest mb-4">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-display font-bold text-brand-400">
                {user?.totalQuizzesTaken || 0}
              </div>
              <div className="text-xs text-white/40 mt-0.5">Quizzes taken</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-accent-400">
                {user?.totalScore || 0}
              </div>
              <div className="text-xs text-white/40 mt-0.5">Total score</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-green-400">
                {user?.totalQuizzesTaken ? Math.round(user.totalScore / user.totalQuizzesTaken) : 0}
              </div>
              <div className="text-xs text-white/40 mt-0.5">Avg. score</div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
