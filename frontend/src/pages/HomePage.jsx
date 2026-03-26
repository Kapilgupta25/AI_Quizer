import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import SiteFooter from '../components/layout/SiteFooter.jsx';

const features = [
  { icon: 'AI', title: 'AI-Generated Questions', desc: 'Powered by Google Gemini so every quiz round can feel fresh and topic-specific.' },
  { icon: 'RT', title: 'Real-time Battles', desc: 'Compete live with friends while everyone sees the same timer and the same question.' },
  { icon: 'LB', title: 'Live Leaderboard', desc: 'Fast and correct answers earn more points while rankings update during the match.' },
  { icon: 'HD', title: 'Custom Difficulty', desc: 'Choose Easy, Medium, or Hard and set the challenge level before the room starts.' },
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center gap-16">
        <div className="flex flex-col items-center gap-6 animate-slide-up">
          <div className="badge bg-brand-500/15 text-brand-300 border border-brand-500/30 text-xs px-3 py-1">
            Powered by Google Gemini AI
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-extrabold leading-[1.05] tracking-tight max-w-3xl">
            Quiz battles,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              powered by AI
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed">
            Create a room, pick a topic, and let AI generate your quiz. Invite friends and compete live
            while the fastest correct answer wins the most points.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/create" className="btn-primary text-base px-8 py-4">
                  Create a Room
                </Link>
                <Link to="/join" className="btn-secondary text-base px-8 py-4">
                  Join a Room
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  Register
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-fade-in">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card p-6 text-left hover:border-brand-500/30 transition-colors"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-sm font-display font-bold text-brand-300">
                {feature.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-1">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
