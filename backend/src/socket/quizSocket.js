import Room from '../models/Room.js';
import Quiz from '../models/Quiz.js';
import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Active quiz timers: roomCode → { questionTimers, quizTimer }
const activeTimers = new Map();

export const setupSocket = (io) => {
  // ─── Auth Middleware ───────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('name avatar email');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} (${socket.user.name})`);

    // ─── Join Room ───────────────────────────────────────────────────────────
    socket.on('room:join', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ code: roomCode.toUpperCase() }).populate(
          'participants.user',
          'name avatar'
        );
        if (!room) return socket.emit('error', { message: 'Room not found' });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        // Notify others
        socket.to(roomCode).emit('room:participant_joined', {
          participant: {
            userId: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar,
          },
        });

        // Send current room state to joining user
        socket.emit('room:state', {
          participants: room.participants.map((p) => ({
            userId: p.user?._id || p.user,
            name: p.name,
            avatar: p.avatar,
            score: p.score,
          })),
          status: room.status,
          owner: room.owner.toString(),
        });

        logger.debug(`${socket.user.name} joined room ${roomCode}`);
      } catch (err) {
        logger.error('room:join error', err);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ─── Start Quiz (owner only) ──────────────────────────────────────────────
    socket.on('quiz:start', async ({ roomCode }) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room) return socket.emit('error', { message: 'Room not found' });
        if (room.owner.toString() !== socket.user._id.toString()) {
          return socket.emit('error', { message: 'Only the room owner can start the quiz' });
        }
        if (room.status !== 'waiting') {
          return socket.emit('error', { message: 'Quiz already started' });
        }
        if (room.participants.length < 1) {
          return socket.emit('error', { message: 'Need at least 1 participant' });
        }

        const quiz = await Quiz.findById(room.quizId);
        if (!quiz) return socket.emit('error', { message: 'Quiz not found' });

        // Update status
        room.status = 'starting';
        room.startedAt = new Date();
        await room.save();

        // Countdown before first question
        io.to(roomCode).emit('quiz:starting', { countdown: 3 });

        await delay(3000);

        room.status = 'active';
        await room.save();

        // Send questions one by one
        await runQuiz(io, socket, room, quiz);
      } catch (err) {
        logger.error('quiz:start error', err);
        socket.emit('error', { message: 'Failed to start quiz' });
      }
    });

    // ─── Submit Answer ────────────────────────────────────────────────────────
    socket.on('quiz:answer', async ({ roomCode, questionIndex, selectedOption, timeTaken }) => {
      try {
        const room = await Room.findOne({ code: roomCode });
        if (!room || room.status !== 'active') return;

        const quiz = await Quiz.findById(room.quizId);
        if (!quiz) return;

        const question = quiz.questions[questionIndex];
        if (!question) return;

        const participantIdx = room.participants.findIndex(
          (p) => p.user.toString() === socket.user._id.toString()
        );
        if (participantIdx === -1) return;

        const participant = room.participants[participantIdx];

        // Prevent duplicate answers for same question
        const alreadyAnswered = participant.answers.some(
          (a) => a.questionIndex === questionIndex
        );
        if (alreadyAnswered) return;

        const isCorrect = selectedOption === question.correctIndex;

        // Scoring: base points * speed bonus
        // Max 1000 pts per question. Speed bonus: faster = more points
        const timeLimit = room.timeLimitSeconds * 1000;
        const speedRatio = Math.max(0, 1 - timeTaken / timeLimit);
        const pointsEarned = isCorrect ? Math.round(500 + 500 * speedRatio) : 0;

        participant.answers.push({
          questionIndex,
          selectedOption,
          isCorrect,
          timeTaken,
          pointsEarned,
        });
        participant.score += pointsEarned;

        await room.save();

        // Confirm to answering user
        socket.emit('quiz:answer_result', {
          questionIndex,
          isCorrect,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
          pointsEarned,
          totalScore: participant.score,
        });

        // Broadcast live scores to room
        io.to(roomCode).emit('quiz:scores_update', {
          scores: room.participants.map((p) => ({
            userId: p.user,
            name: p.name,
            score: p.score,
          })),
        });
      } catch (err) {
        logger.error('quiz:answer error', err);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.roomCode) {
        socket.to(socket.roomCode).emit('room:participant_left', {
          userId: socket.user._id,
          name: socket.user.name,
        });
      }
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });
};

// ─── Quiz Runner ───────────────────────────────────────────────────────────────
async function runQuiz(io, socket, room, quiz) {
  console.log("========================================");
  console.log('My Quiz:', quiz);
  const roomCode = room.code;
  const timeLimitMs = room.timeLimitSeconds * 1000;

  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];

    // Send question WITHOUT correctIndex
    io.to(roomCode).emit('quiz:question', {
      questionIndex: i,
      total: quiz.questions.length,
      question: question.question,
      options: question.options,
      timeLimit: room.timeLimitSeconds,
    });

    // Wait for time limit
    await delay(timeLimitMs);

    // After time: reveal correct answer to all
    io.to(roomCode).emit('quiz:question_end', {
      questionIndex: i,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    });

    // Brief pause between questions
    if (i < quiz.questions.length - 1) {
      await delay(3000);
    }
  }

  // Quiz finished
  const finalRoom = await Room.findOne({ code: roomCode });
  finalRoom.status = 'finished';
  finalRoom.finishedAt = new Date();
  await finalRoom.save();

  const leaderboard = finalRoom.participants
    .map((p) => ({
      userId: p.user,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      correctAnswers: p.answers.filter((a) => a.isCorrect).length,
      totalAnswers: p.answers.length,
    }))
    .sort((a, b) => b.score - a.score);

  io.to(roomCode).emit('quiz:finished', { leaderboard });
  logger.info(`Quiz finished for room ${roomCode}`);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));