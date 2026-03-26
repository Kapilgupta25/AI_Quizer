import Room from '../models/Room.js';
import Quiz from '../models/Quiz.js';
import { generateQuiz } from '../services/geminiService.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ─── Create Room ──────────────────────────────────────────────────────────────
export const createRoom = async (req, res) => {
  try {
    const { topic, questionCount, difficulty, timeLimitSeconds } = req.body;
    const userId = req.user._id;

    // Generate unique room code
    let code;
    let attempts = 0;
    do {
      code = generateRoomCode();
      attempts++;
      if (attempts > 10) throw new Error('Could not generate unique room code');
    } while (await Room.findOne({ code }));

    // Generate quiz questions via Gemini
    logger.info(`Generating quiz for room ${code}: topic="${topic}", difficulty=${difficulty}`);
    const questions = await generateQuiz({ topic, questionCount, difficulty });

    // Save quiz
    const quiz = new Quiz({ topic, difficulty, questions, roomId: null });
    await quiz.save();

    // Save room
    const room = new Room({
      code,
      topic,
      difficulty,
      questionCount: questions.length,
      timeLimitSeconds,
      owner: userId,
      quizId: quiz._id,
      participants: [
        {
          user: userId,
          name: req.user.name,
          avatar: req.user.avatar,
          score: 0,
          answers: [],
        },
      ],
    });
    await room.save();

    quiz.roomId = room._id;
    await quiz.save();

    // Cache room state in Redis for fast real-time access
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      await redis.set(
        `room:${code}`,
        JSON.stringify({ status: 'waiting', participantCount: 1 }),
        'EX',
        86400
      );
    }

    logger.info(`Room ${code} created by user ${userId}`);
    res.status(201).json({
      room: {
        _id: room._id,
        code: room.code,
        topic: room.topic,
        difficulty: room.difficulty,
        questionCount: room.questionCount,
        timeLimitSeconds: room.timeLimitSeconds,
        status: room.status,
        owner: room.owner,
        participants: room.participants,
      },
    });
  } catch (error) {
    logger.error('Create room error:', error);
    if (error.message.includes('generate quiz')) {
      return res.status(503).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create room' });
  }
};

// ─── Join Room ────────────────────────────────────────────────────────────────
export const joinRoom = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status === 'finished') return res.status(400).json({ error: 'Quiz has already ended' });
    if (room.status === 'active') return res.status(400).json({ error: 'Quiz already in progress' });
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const alreadyJoined = room.participants.some(
      (p) => p.user.toString() === userId.toString()
    );

    if (!alreadyJoined) {
      room.participants.push({
        user: userId,
        name: req.user.name,
        avatar: req.user.avatar,
        score: 0,
        answers: [],
      });
      await room.save();
    }

    res.json({
      room: {
        _id: room._id,
        code: room.code,
        topic: room.topic,
        difficulty: room.difficulty,
        questionCount: room.questionCount,
        timeLimitSeconds: room.timeLimitSeconds,
        status: room.status,
        owner: room.owner,
        participants: room.participants,
      },
    });
  } catch (error) {
    logger.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

// ─── Get Room ─────────────────────────────────────────────────────────────────
export const getRoom = async (req, res) => {
  try {
    const { code } = req.params;
    const room = await Room.findOne({ code: code.toUpperCase() })
      .populate('owner', 'name avatar')
      .populate('participants.user', 'name avatar');

    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

// ─── Get Leaderboard ──────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const { code } = req.params;
    const room = await Room.findOne({ code: code.toUpperCase() }).populate(
      'participants.user',
      'name avatar'
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const leaderboard = room.participants
      .map((p) => ({
        userId: p.user?._id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        correctAnswers: p.answers.filter((a) => a.isCorrect).length,
        totalAnswers: p.answers.length,
        finished: p.finished,
      }))
      .sort((a, b) => b.score - a.score);

    res.json({ leaderboard, roomStatus: room.status, topic: room.topic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
