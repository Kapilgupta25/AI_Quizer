import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }], // 4 options
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: String,
});

const quizSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    questions: [questionSchema],
    generatedBy: { type: String, default: 'gemini' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;