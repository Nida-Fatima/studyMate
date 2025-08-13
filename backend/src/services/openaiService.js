const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

class OpenAIService {
  async generateStudyMaterial(
    content,
    format,
    difficulty = "medium",
    length = "medium"
  ) {
    try {
      const systemMessages = {
        summary: `You are an expert study assistant. Create a comprehensive ${difficulty}-level summary of the provided content. Make it ${length} in length. Focus on key concepts, important terms, and main ideas. Format with clear headings, bullet points, and use double newlines for paragraphs. Use markdown formatting.`,

        flashcards: `You are an expert study assistant. Create ${difficulty}-level flashcards from the provided content. Generate ${this.getCardCount(
          length
        )} question-answer pairs. Focus on key concepts, definitions, and important facts. Format as clear Q&A pairs with markdown, using double newlines between each flashcard. Each flashcard should test understanding, not just memorization.`,

        quiz: `You are an expert study assistant. Create a ${difficulty}-level practice quiz from the provided content. Include ${this.getQuestionCount(
          length
        )} questions with a mix of multiple choice and short answer questions. Provide correct answers and explanations. Format clearly with markdown, using headings for questions and double newlines between questions and answers.`,

        outline: `You are an expert study assistant. Create a ${difficulty}-level study outline from the provided content. Make it ${length} in detail with clear hierarchical structure. Include main topics, subtopics, and key points. Use proper markdown formatting with consistent heading levels (e.g., # for main topics, ## for subtopics) and nested lists.`,
      };

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku",
        messages: [
          {
            role: "system",
            content: systemMessages[format] || systemMessages.summary,
          },
          {
            role: "user",
            content: `Please generate ${format} study material from this content and format it using markdown:

${content}`,
          },
        ],
        temperature: 0.7,
        max_tokens: this.getMaxTokens(length),
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to generate ${format}: ${error.message}`);
    }
  }

  async generateStudyPlan(content, daysToPrepare, hoursPerDay) {
    try {
      const prompt = `You are an expert study planner. Create a comprehensive and detailed study plan based on the following material, the number of days the user has to prepare, and the user's available study time per day. The plan should be structured, actionable, and help the user effectively learn the content within the given timeframe.

Material to study:
"""
${content}
"""

Days to prepare: ${daysToPrepare}
Available study hours per day: ${hoursPerDay}

Your study plan should include:
- A clear schedule with daily or weekly tasks, considering the available hours per day.
- Breakdown of topics to cover.
- Suggested study methods (e.g., active recall, spaced repetition).
- Milestones or checkpoints.
- Tips for effective learning and time management.
- Format the plan using clear Markdown headings (e.g., #, ##, ###), bold text (e.g., **Important**), bullet points, and tables where appropriate. Ensure it's easy to read and follow.`;

      const response = await openai.chat.completions.create({
        model: "anthropic/claude-3-haiku", // Or another suitable model
        messages: [
          {
            role: "system",
            content: "You are a helpful study planner AI. Always respond with a well-structured and actionable study plan in Markdown format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000, // Adjust as needed for detailed plans
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error (Study Plan):", error);
      throw new Error(`Failed to generate study plan: ${error.message}`);
    }
  }

  getCardCount(length) {
    const counts = { short: "4-6", medium: "6-8", long: "8-12" };
    return counts[length] || "6-8";
  }

  getQuestionCount(length) {
    const counts = { short: "3-5", medium: "5-7", long: "7-10" };
    return counts[length] || "5-7";
  }

  getMaxTokens(length) {
    const tokens = { short: 800, medium: 1200, long: 1800 };
    return tokens[length] || 1200;
  }
}

module.exports = new OpenAIService();
