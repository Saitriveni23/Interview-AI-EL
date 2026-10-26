import { GoogleGenAI } from '@google/genai';

export async function generateGeminiQuestions(skills) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in .env');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a professional technical interviewer.

Generate 3 interview questions for these skills:
${skills.join(', ')}

Requirements:
1. Questions must be relevant to the given skills.
2. Include beginner, intermediate, and advanced difficulty.
3. Avoid repeating questions.
4. Return only a JSON array.

Each question must contain:
- skill
- difficulty
- question
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const questions = JSON.parse(response.text);

  if (!Array.isArray(questions)) {
    throw new Error('Gemini did not return a question array');
  }

  return questions;
}