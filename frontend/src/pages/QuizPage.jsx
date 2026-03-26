import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { useAuthStore } from '../store/authStore.js';

const sortScores = (items = []) => [...items].sort((a, b) => b.score - a.score);

export default function QuizPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const questionStartedAtRef = useRef(0);

  const [room, setRoom] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let active = true;
    let socket;

    const loadRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${code}`);
        if (!active) return;

        setRoom(data.room);
        setScores(
          sortScores(
            data.room.participants.map((participant) => ({
              userId: participant.user?._id || participant.user,
              name: participant.name,
              score: participant.score ?? 0,
            }))
          )
        );

        if (data.room.status === 'finished') {
          navigate(`/results/${code}`, { replace: true });
          return;
        }

        socket = getSocket();
        socket.emit('room:join', { roomCode: code });

        const handleRoomState = ({ participants, status }) => {
          setScores(sortScores(participants.map((participant) => ({
            userId: participant.userId,
            name: participant.name,
            score: participant.score ?? 0,
          }))));

          if (status === 'finished') {
            navigate(`/results/${code}`, { replace: true });
          }
        };

        const handleQuestion = ({ questionIndex: nextIndex, total, question, options, timeLimit }) => {
          questionStartedAtRef.current = Date.now();
          setQuestionIndex(nextIndex);
          setTotalQuestions(total);
          setCurrentQuestion({ question, options });
          setTimeLeft(timeLimit);
          setSelectedOption(null);
          setReveal(null);
          setAnswerResult(null);
        };

        const handleQuestionEnd = ({ correctIndex, explanation }) => {
          setReveal({ correctIndex, explanation });
          setTimeLeft(0);
        };

        const handleAnswerResult = (result) => {
          setAnswerResult(result);
        };

        const handleScoresUpdate = ({ scores: nextScores }) => {
          setScores(sortScores(nextScores));
        };

        const handleFinished = ({ leaderboard }) => {
          navigate(`/results/${code}`, {
            replace: true,
            state: { leaderboard, topic: data.room.topic, roomStatus: 'finished' },
          });
        };

        const handleError = ({ message }) => {
          if (message) toast.error(message);
        };

        socket.on('room:state', handleRoomState);
        socket.on('quiz:question', handleQuestion);
        socket.on('quiz:question_end', handleQuestionEnd);
        socket.on('quiz:answer_result', handleAnswerResult);
        socket.on('quiz:scores_update', handleScoresUpdate);
        socket.on('quiz:finished', handleFinished);
        socket.on('error', handleError);

        return () => {
          socket.off('room:state', handleRoomState);
          socket.off('quiz:question', handleQuestion);
          socket.off('quiz:question_end', handleQuestionEnd);
          socket.off('quiz:answer_result', handleAnswerResult);
          socket.off('quiz:scores_update', handleScoresUpdate);
          socket.off('quiz:finished', handleFinished);
          socket.off('error', handleError);
        };
      } catch (error) {
        toast.error('Unable to load the quiz room');
        navigate('/dashboard', { replace: true });
        return undefined;
      }
    };

    let cleanupListeners;
    loadRoom().then((cleanup) => {
      cleanupListeners = cleanup;
    });

    return () => {
      active = false;
      if (cleanupListeners) cleanupListeners();
    };
  }, [code, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || reveal) return undefined;

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft, reveal]);

  const handleAnswer = (optionIndex) => {
    if (!currentQuestion || selectedOption !== null || reveal) return;

    setSelectedOption(optionIndex);
    getSocket().emit('quiz:answer', {
      roomCode: code,
      questionIndex,
      selectedOption: optionIndex,
      timeTaken: Date.now() - questionStartedAtRef.current,
    });
  };

  const playerScore = scores.find(
    (entry) => entry.userId?.toString() === user?._id?.toString()
  )?.score ?? 0;

  const getOptionClassName = (optionIndex) => {
    if (reveal) {
      if (optionIndex === reveal.correctIndex) {
        return 'border-green-400/50 bg-green-400/10 text-green-100';
      }
      if (optionIndex === selectedOption) {
        return 'border-red-400/50 bg-red-400/10 text-red-100';
      }
      return 'border-white/10 bg-surface-800/40 text-white/60';
    }

    if (optionIndex === selectedOption) {
      return 'border-brand-400 bg-brand-500/10 text-white';
    }

    return 'border-white/10 bg-surface-800/50 text-white hover:border-white/20 hover:bg-surface-800/70';
  };

  if (!room) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="badge border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs px-3 py-1">
                Room {code}
              </div>
              <h1 className="mt-3 text-3xl font-display font-bold">{room.topic}</h1>
              <p className="mt-1 text-sm text-white/50">
                {currentQuestion
                  ? `Question ${questionIndex + 1} of ${totalQuestions}`
                  : 'Waiting for the next question to arrive'}
              </p>
            </div>
            <div className="min-w-[92px] rounded-2xl border border-white/10 bg-surface-800/70 px-4 py-3 text-center">
              <div className="text-xs uppercase tracking-[0.25em] text-white/35">Time</div>
              <div className="mt-1 text-3xl font-display font-bold text-brand-300">
                {timeLeft ?? room.timeLimitSeconds}
              </div>
            </div>
          </div>

          {!currentQuestion ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-surface-800/30 px-6 py-12 text-center">
              <p className="text-lg font-display font-semibold">Quiz is getting ready</p>
              <p className="mt-2 text-sm text-white/45">
                Stay on this screen. The next question will appear automatically.
              </p>
              <Link to={`/room/${code}`} className="btn-secondary mt-6">
                Back to lobby
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-surface-800/40 p-6">
                <p className="text-lg leading-relaxed sm:text-xl">{currentQuestion.question}</p>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <button
                    key={`${questionIndex}-${optionIndex}`}
                    type="button"
                    onClick={() => handleAnswer(optionIndex)}
                    disabled={selectedOption !== null || !!reveal}
                    className={`rounded-2xl border p-4 text-left transition-all ${getOptionClassName(optionIndex)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-display">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="text-sm leading-relaxed sm:text-base">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {answerResult && (
                <div className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display font-semibold">
                      {answerResult.isCorrect ? 'Correct answer' : 'Answer locked in'}
                    </p>
                    <span className="badge bg-brand-500/15 text-brand-300 text-xs px-3 py-1">
                      +{answerResult.pointsEarned} pts
                    </span>
                  </div>
                </div>
              )}

              {reveal && (
                <div className="card p-5">
                  <p className="font-display font-semibold text-brand-300">Answer summary</p>
                  <p className="mt-2 text-sm text-white/70">
                    Correct option: {String.fromCharCode(65 + reveal.correctIndex)}
                  </p>
                  {reveal.explanation ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/55">{reveal.explanation}</p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-white/45">
            Your score
          </h2>
          <div className="mt-3 text-4xl font-display font-bold text-brand-300">{playerScore}</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-white/45">
              Live standings
            </h2>
            <span className="text-xs text-white/30">{scores.length} players</span>
          </div>

          <div className="mt-4 space-y-2">
            {scores.map((entry, index) => {
              const isCurrentUser = entry.userId?.toString() === user?._id?.toString();

              return (
                <div
                  key={entry.userId || `${entry.name}-${index}`}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                    isCurrentUser
                      ? 'border-brand-500/30 bg-brand-500/10'
                      : 'border-white/10 bg-surface-800/40'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-display font-semibold text-white/60">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.name}</p>
                    <p className="text-xs text-white/35">{isCurrentUser ? 'You' : 'Player'}</p>
                  </div>
                  <div className="text-sm font-display font-semibold text-brand-300">{entry.score}</div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
