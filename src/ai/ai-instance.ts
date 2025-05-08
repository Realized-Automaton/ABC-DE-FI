
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// Removed import for openai plugin

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // Keep Gemini available if needed
    }),
    // Removed openai plugin configuration
  ],
  // Default model remains Gemini
  model: 'googleai/gemini-2.0-flash',
});
