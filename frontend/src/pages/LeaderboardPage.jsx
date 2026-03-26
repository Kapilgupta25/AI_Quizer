import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';

const sortLeaderboard = (items = []) => [...items].sort((a, b) => b.score - a.score);

export default function LeaderboardPage() {
  const { code } = useParams();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const [leaderboard, setLeaderboard] = useState(
    sortLeaderboard(Array.isArray(location.state?.leaderboard) ? location.state.leaderboard : [])
  );
  const [topic, setTopic] = useState(location.state?.topic ?? '');
  const [roomStatus, setRoomStatus] = useState(location.state?.roomStatus ?? '');
  const [loading, setLoading] = useState(leaderboard.length === 0);

  useEffect(() => {
    let active = true;

    const loadLeaderboard = async () => {
      try {
        const { data } = await api.get(`/rooms/${code}/leaderboard`);
        if (!active) return;

        setLeaderboard(sortLeaderboard(data.leaderboard));
        setTopic(data.topic);
        setRoomStatus(data.roomStatus);
      } catch (error) {
        if (active) toast.error('Unable to load the leaderboard');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLeaderboard();

    return () => {
      active = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="badge border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs px-3 py-1">
          Results for room {code}
        </div>
        <h1 className="mt-4 text-4xl font-display font-bold">Final leaderboard</h1>
        <p className="mt-2 text-sm text-white/50">
          {topic || 'Quiz results'}{roomStatus ? ` | ${roomStatus}` : ''}
        </p>
      </div>

      <div className="card overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/45">
            No scores have been recorded for this room yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId?.toString() === user?._id?.toString();

              return (
                <div
                  key={entry.userId || `${entry.name}-${index}`}
                  className={`flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center ${
                    isCurrentUser ? 'bg-brand-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-800 text-lg font-display font-bold text-brand-300">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-display font-semibold">
                        {entry.name}
                        {isCurrentUser ? ' (you)' : ''}
                      </p>
                      <p className="text-sm text-white/45">
                        {entry.correctAnswers ?? 0} correct out of {entry.totalAnswers ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="sm:ml-auto sm:text-right">
                    <div className="text-2xl font-display font-bold text-brand-300">{entry.score}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard" className="btn-primary">
          Back to dashboard
        </Link>
        <Link to={`/room/${code}`} className="btn-secondary">
          Return to room
        </Link>
      </div>
    </div>
  );
}
