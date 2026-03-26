import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function JoinRoomPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      toast.error('Enter a 6-character room code');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/rooms/${code.toUpperCase()}/join`);
      navigate(`/room/${code.toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-pop">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Join a Room</h1>
          <p className="text-white/50 text-sm">Enter the 6-character room code</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <input
            type="text"
            className="input-field text-center text-3xl font-mono tracking-[0.3em] uppercase py-5"
            placeholder="ABCDEF"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            autoFocus
          />
          <button type="submit" disabled={loading || code.length !== 6} className="btn-primary py-4">
            {loading ? 'Joining…' : 'Join Room →'}
          </button>
        </form>
      </div>
    </div>
  );
}