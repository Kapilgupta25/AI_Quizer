import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

const getParticipantId = (participant) =>
  participant?.userId?.toString?.() ||
  participant?.user?._id?.toString?.() ||
  participant?.user?.toString?.() ||
  null;

const normalizeParticipant = (participant) => ({
  ...participant,
  userId: getParticipantId(participant),
  name: participant?.name || participant?.user?.name || 'Player',
  avatar: participant?.avatar || participant?.user?.avatar || null,
});

const normalizeParticipants = (list = []) => {
  const seen = new Set();

  return list.reduce((acc, participant) => {
    const normalized = normalizeParticipant(participant);
    const uniqueKey = normalized.userId || `${normalized.name}-${acc.length}`;

    if (seen.has(uniqueKey)) return acc;

    seen.add(uniqueKey);
    acc.push(normalized);
    return acc;
  }, []);
};

export default function LobbyPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    let socket;

    const handleRoomState = ({ participants: nextParticipants }) => {
      setParticipants(normalizeParticipants(nextParticipants));
    };

    const handleParticipantJoined = ({ participant }) => {
      const nextParticipant = normalizeParticipant(participant);

      setParticipants((prev) => {
        if (prev.some((entry) => entry.userId === nextParticipant.userId)) return prev;
        return normalizeParticipants([...prev, nextParticipant]);
      });

      toast(`${nextParticipant.name} joined`, { icon: '👋' });
    };

    const handleParticipantLeft = ({ userId, name }) => {
      setParticipants((prev) =>
        prev.filter((participant) => participant.userId !== userId?.toString())
      );
      toast(`${name} left`, { icon: '👋' });
    };

    const handleQuizStarting = ({ countdown: nextCountdown }) => {
      setStarting(true);
      setCountdown(nextCountdown);

      let current = nextCountdown;
      const interval = window.setInterval(() => {
        current -= 1;
        setCountdown(current);

        if (current <= 0) {
          window.clearInterval(interval);
          navigate(`/quiz/${code}`);
        }
      }, 1000);
    };

    const handleSocketError = ({ message }) => {
      if (message) toast.error(message);
    };

    const init = async () => {
      try {
        const { data } = await api.get(`/rooms/${code}`);
        setRoom(data.room);
        setParticipants(normalizeParticipants(data.room.participants));

        socket = getSocket();
        socket.emit('room:join', { roomCode: code });
        socket.on('room:state', handleRoomState);
        socket.on('room:participant_joined', handleParticipantJoined);
        socket.on('room:participant_left', handleParticipantLeft);
        socket.on('quiz:starting', handleQuizStarting);
        socket.on('error', handleSocketError);
      } catch (error) {
        toast.error('Room not found');
        navigate('/dashboard');
      }
    };

    init();

    return () => {
      if (!socket) return;

      socket.off('room:state', handleRoomState);
      socket.off('room:participant_joined', handleParticipantJoined);
      socket.off('room:participant_left', handleParticipantLeft);
      socket.off('quiz:starting', handleQuizStarting);
      socket.off('error', handleSocketError);
    };
  }, [code, navigate]);

  const handleStart = () => {
    getSocket().emit('quiz:start', { roomCode: code });
  };

  const ownerId = room?.owner?._id?.toString() || room?.owner?.toString();
  const isOwner = ownerId === user?._id?.toString();

  if (!room) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {starting && countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/95 backdrop-blur-md">
          <div className="text-center animate-pop">
            <div className="text-9xl font-display font-extrabold text-brand-400 animate-pulse">
              {countdown > 0 ? countdown : 'GO'}
            </div>
            <p className="mt-4 text-lg font-display text-white/50">Quiz starting</p>
          </div>
        </div>
      )}

      <div className="mb-8 animate-slide-up">
        <div className="mb-3 flex items-center gap-2">
          <span className="badge border border-white/10 bg-surface-800 px-3 py-1 font-mono text-xs text-white/60">
            {code}
          </span>
          <span
            className={`badge px-2 py-1 text-xs ${
              room.difficulty === 'easy'
                ? 'bg-green-400/10 text-green-400'
                : room.difficulty === 'medium'
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'bg-red-400/10 text-red-400'
            }`}
          >
            {room.difficulty}
          </span>
        </div>
        <h1 className="mb-1 text-3xl font-display font-bold">{room.topic}</h1>
        <p className="text-sm text-white/50">
          {room.questionCount} questions · {room.timeLimitSeconds}s per question
        </p>
      </div>

      <div className="card mb-6 p-5 animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-white/50">
            Players ({participants.length})
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Waiting
          </div>
        </div>

        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div
              key={participant.userId || `${participant.name}-${index}`}
              className="flex items-center gap-3 py-2"
            >
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/30 text-sm font-display font-semibold text-brand-300">
                  {participant.name?.[0]?.toUpperCase()}
                </div>
              )}

              <span className="text-sm font-medium">{participant.name}</span>

              {participant.userId === ownerId && (
                <span className="badge ml-auto bg-brand-500/15 text-xs text-brand-300">Owner</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOwner ? (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <button onClick={handleStart} className="btn-primary w-full py-4 text-base">
            Start Quiz
          </button>
          <p className="mt-2 text-center text-xs text-white/30">
            Share code <strong className="font-mono text-white/50">{code}</strong> with friends before starting
          </p>
        </div>
      ) : (
        <div className="card p-4 text-center text-sm text-white/40 animate-slide-up">
          Waiting for the room owner to start the quiz...
        </div>
      )}
    </div>
  );
}
