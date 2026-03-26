import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    topic: { type: String, required: true, trim: true, maxlength: 100 },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionCount: { type: Number, required: true, min: 3, max: 20 },
    timeLimitSeconds: { type: Number, required: true, min: 10, max: 60 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['waiting', 'starting', 'active', 'finished'],
      default: 'waiting',
      index: true,
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        avatar: String,
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        answers: [
          {
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean,
            timeTaken: Number, // milliseconds
            pointsEarned: Number,
          },
        ],
        finished: { type: Boolean, default: false },
      },
    ],
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    startedAt: Date,
    finishedAt: Date,
    maxParticipants: { type: Number, default: 20 },
  },
  { timestamps: true }
);

// Auto-expire finished rooms after 24h
roomSchema.index({ finishedAt: 1 }, { expireAfterSeconds: 86400, sparse: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;