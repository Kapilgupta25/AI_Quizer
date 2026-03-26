import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const difficulties = [
  { value: 'easy', label: 'Easy', desc: 'Beginner friendly', color: 'text-green-400', bg: 'border-green-400/40 bg-green-400/10' },
  { value: 'medium', label: 'Medium', desc: 'Solid challenge', color: 'text-amber-400', bg: 'border-amber-400/40 bg-amber-400/10' },
  { value: 'hard', label: 'Hard', desc: 'Expert level', color: 'text-red-400', bg: 'border-red-400/40 bg-red-400/10' },
];

export default function CreateRoomPage() {
  const [form, setForm] = useState({
    topic: '',
    questionCount: 5,
    difficulty: 'medium',
    timeLimitSeconds: 20,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('🤖 Generating your quiz with AI…');
    try {
      const { data } = await api.post('/rooms', form);
      toast.dismiss(tid);
      toast.success('Room created!');
      navigate(`/room/${data.room.code}`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-display font-bold mb-2">Create a Room</h1>
        <p className="text-white/50 text-sm">AI will generate your quiz questions automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-slide-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        {/* Topic */}
        <div className="card p-5">
          <label className="block text-xs text-white/50 mb-2 font-display uppercase tracking-wider">Topic</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. World War II, Python Programming, Solar System…"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            required
            maxLength={100}
          />
          <p className="text-xs text-white/30 mt-1.5">Be specific for better questions</p>
        </div>

        {/* Difficulty */}
        <div className="card p-5">
          <label className="block text-xs text-white/50 mb-3 font-display uppercase tracking-wider">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setForm({ ...form, difficulty: d.value })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.difficulty === d.value
                    ? d.bg + ' ' + d.color
                    : 'border-white/10 text-white/40 hover:border-white/20'
                }`}
              >
                <div className="font-display font-semibold text-sm">{d.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Questions & Time */}
        <div className="card p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-2 font-display uppercase tracking-wider">
              Questions: <span className="text-brand-400">{form.questionCount}</span>
            </label>
            <input
              type="range" min={3} max={20} step={1}
              value={form.questionCount}
              onChange={(e) => setForm({ ...form, questionCount: +e.target.value })}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>3</span><span>20</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-display uppercase tracking-wider">
              Time/Q: <span className="text-brand-400">{form.timeLimitSeconds}s</span>
            </label>
            <input
              type="range" min={10} max={60} step={5}
              value={form.timeLimitSeconds}
              onChange={(e) => setForm({ ...form, timeLimitSeconds: +e.target.value })}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>10s</span><span>60s</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary py-4 text-base">
          {loading ? '🤖 Generating quiz…' : '✨ Create Room'}
        </button>
      </form>
    </div>
  );
}