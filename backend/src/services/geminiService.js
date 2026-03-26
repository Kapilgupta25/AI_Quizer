import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const DIFFICULTY_PROMPTS = {
  easy: 'basic, beginner-friendly questions that test fundamental knowledge',
  medium: 'moderate questions requiring solid understanding and some analytical thinking',
  hard: 'challenging, advanced questions requiring deep expertise and critical thinking',
};

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateQuiz = async ({ topic, questionCount, difficulty }) => {
  const model = getGeminiModel();

  const prompt = `Generate a quiz about "${topic}" with exactly ${questionCount} questions.
Difficulty: ${difficulty} — ${DIFFICULTY_PROMPTS[difficulty]}.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}

Rules:
- Exactly ${questionCount} questions
- Each question has exactly 4 options
- correctIndex is 0-3 (index of the correct option)
- Questions must be factually accurate
- Vary question types (definition, application, analysis)
- Make wrong options plausible but clearly incorrect
- Keep questions concise (under 120 characters ideally)`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz structure from AI');
    }

    // Validate each question
    const validated = parsed.questions.slice(0, questionCount).map((q, i) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${i}`);
      }
      if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error(`Invalid correctIndex at question ${i}`);
      }
      return {
        question: String(q.question),
        options: q.options.map(String),
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
      };
    });
    

    logger.info(`Generated ${validated.length} questions for topic: "${topic}"`);
    return validated;
  } catch (error) {
    logger.error(`Gemini generation error: ${error.message}`);

    if (error.message.includes('GEMINI_API_KEY is missing')) {
      throw new Error('Gemini API key is missing on the server.');
    }

    if (error.message.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key is invalid. Update GEMINI_API_KEY in the backend env file.');
    }

    if (error.message.includes('not found for API version') || error.message.includes('not supported for generateContent')) {
      throw new Error('Gemini model is unavailable. Update GEMINI_MODEL in the backend env file.');
    }

    throw new Error('Failed to generate quiz questions. Please try again.');
  }
};
