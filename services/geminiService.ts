import { GoogleGenerativeAI } from '@google/generative-ai';

// You'll need to add your Gemini API key here
// Get it from: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-gemini-api-key-here';

console.log('Gemini API Key configured:', GEMINI_API_KEY ? '✓ Present' : '✗ Missing');
console.log('API Key starts with:', GEMINI_API_KEY?.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ChatContext {
  podcastTitle?: string;
  podcastTranscript?: string;
  podcastDescription?: string;
  category?: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

  async sendMessage(userMessage: string, context?: ChatContext): Promise<string> {
    console.log('🤖 Gemini sendMessage called with:', {
      userMessage: userMessage.substring(0, 50) + '...',
      hasContext: !!context,
      podcastTitle: context?.podcastTitle
    });

    try {
      // Check if API key is valid
      if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
        throw new Error('Invalid API key configuration');
      }

      // Build context-aware system prompt
      let systemPrompt = `You are an AI assistant helping users understand educational podcast content. You are knowledgeable, helpful, and focused on learning.

Guidelines:
- Answer questions about the podcast content accurately
- Provide educational insights and explanations
- Suggest study tips and follow-up learning
- Keep responses conversational and engaging
- If asked about something not in the podcast, politely indicate that and offer to help with what you do know

`;

      // Add podcast-specific context if available
      if (context?.podcastTitle) {
        systemPrompt += `Current podcast: "${context.podcastTitle}"\n\n`;
      }

      if (context?.podcastDescription) {
        systemPrompt += `Podcast description: ${context.podcastDescription}\n\n`;
      }

      if (context?.podcastTranscript) {
        systemPrompt += `Podcast transcript for reference:\n${context.podcastTranscript}\n\n`;
      }

      systemPrompt += `User question: ${userMessage}`;

      console.log('📝 Sending prompt to Gemini (length:', systemPrompt.length, 'chars)');

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('✅ Gemini response received (length:', responseText.length, 'chars)');
      return responseText;
    } catch (error) {
      console.error('❌ Gemini API error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200),
        apiKeyConfigured: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key-here'
      });

      // Fallback responses based on context
      if (context?.podcastTitle) {
        return `I'm having trouble connecting to the AI service right now, but I'd love to help you with questions about "${context.podcastTitle}". Please try again in a moment!`;
      }

      return "I'm having trouble connecting right now. Please try again in a moment!";
    }
  }

  async generateStudyQuestions(context: ChatContext): Promise<string[]> {
    try {
      let prompt = `Based on this educational podcast content, generate 3 thoughtful study questions that would help students review and understand the key concepts:\n\n`;

      if (context.podcastTitle) {
        prompt += `Podcast: ${context.podcastTitle}\n`;
      }

      if (context.podcastDescription) {
        prompt += `Description: ${context.podcastDescription}\n`;
      }

      if (context.podcastTranscript) {
        prompt += `Content: ${context.podcastTranscript}\n`;
      }

      prompt += `\nReturn only the questions, one per line, numbered 1-3.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response into an array of questions
      return text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);
    } catch (error) {
      console.error('Error generating study questions:', error);
      return [
        "What were the main concepts discussed in this podcast?",
        "How can you apply these ideas in practice?",
        "What questions do you still have about this topic?"
      ];
    }
  }
}

export const geminiService = new GeminiService();