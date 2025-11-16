import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Quest, ChatMode } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatSession: Chat | null = null;

export async function generateQuests(existingTitles: string[], isWeekend: boolean): Promise<Omit<Quest, 'id' | 'isCompleted'>[]> {
  const weekendPromptPart = isWeekend 
    ? "These should be special 'Weekend Warrior' quests, slightly more challenging or creative, and can be worth more XP (up to 75)."
    : "The quests should be actionable and verifiable.";

  const prompt = `Generate 3 new, unique, and fun quests for an 11-year-old boy named Jeremy.
  The goal is to help him improve memory, observation, and responsibility.
  Focus on common issues like forgetting items (books, belt, water bottle), not following through on tasks, and being more observant.
  ${weekendPromptPart}
  Do not generate quests with these titles: ${existingTitles.join(', ')}.`;

  const questSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A short, engaging title for the quest (max 5 words).",
        },
        description: {
          type: Type.STRING,
          description: "A brief, clear description of what the user needs to do.",
        },
        xp: {
          type: Type.INTEGER,
          description: `Experience points awarded for completion, between 20 and ${isWeekend ? 75 : 50}.`,
        },
      },
      required: ["title", "description", "xp"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questSchema,
      },
    });

    const jsonText = response.text.trim();
    const quests = JSON.parse(jsonText).map((q: any) => ({...q, isWeekendQuest: isWeekend, requiresInput: true }));
    
    if (Array.isArray(quests)) {
        return quests;
    }
    return [];

  } catch (error)
 {
    console.error("Error generating quests:", error);
    return [];
  }
}

export async function evaluateQuest(quest: Quest, userInput: string): Promise<{ completed: boolean, feedback:string, xpAwarded: number }> {
    const prompt = `You are an encouraging and fair guide for an 11-year-old boy named Jeremy.
    His mission was:
    Title: "${quest.title}"
    Description: "${quest.description}"

    He reported what he did: "${userInput}"

    Based on his report, evaluate if he successfully completed the mission.
    - Be encouraging, even if he didn't do it perfectly.
    - Award XP based on effort and success. Max XP is ${quest.xp}. If he did it well, give full points. If he tried but missed something, give partial points. If he didn't really try, give 0-5 points for honesty.
    - Provide short, positive feedback (1-2 sentences).

    Return your evaluation as a JSON object with this exact schema.`;

    const evaluationSchema = {
        type: Type.OBJECT,
        properties: {
            completed: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            xpAwarded: { type: Type.INTEGER }
        },
        required: ["completed", "feedback", "xpAwarded"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: evaluationSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (typeof result.completed === 'boolean' && typeof result.feedback === 'string' && typeof result.xpAwarded === 'number') {
            return result;
        }
        throw new Error("Invalid JSON schema from Gemini");

    } catch (error) {
        console.error("Error evaluating quest:", error);
        return { completed: false, feedback: "I had a little trouble reviewing that. Could you try submitting again?", xpAwarded: 0 };
    }
}


export function startChat(mode: ChatMode, curriculumContent: string | null): void {
    let systemInstruction = `You are Sparky, a friendly and encouraging AI guide for an 11-year-old boy named Jeremy. Your goal is to help him improve his memory and responsibility in a fun, gamified way. Keep your answers short, positive, and use simple language. You can use emojis to make it more engaging. Address Jeremy by his name sometimes.`;
    
    switch(mode) {
        case 'tutor':
            systemInstruction = `You are a helpful and patient Homework Tutor for an 11-year-old boy named Jeremy. Your name is Sparky.
            Your goal is to help him understand concepts from his curriculum without giving direct answers.
            Guide him through problems step-by-step, ask leading questions, and use simple analogies related to his interests (gaming, sports) to explain complex topics.
            Be encouraging and celebrate his effort. Use emojis!`;
            break;
        case 'exam':
            systemInstruction = `You are an energetic Exam Prep Coach for an 11-year-old boy named Jeremy. Your name is Sparky.
            Your goal is to get him ready for his tests!
            Use his curriculum to create fun, multiple-choice or short-answer quizzes.
            Keep the pace upbeat and give immediate feedback on his answers. Offer study tips and memory tricks.
            Let's get that A+! 🚀`;
            break;
    }


    if (curriculumContent) {
        systemInstruction += `

You also have access to Jeremy's school curriculum. Use the curriculum below to base your conversations, quizzes, and explanations. Make learning an adventure!

--- CURRICULUM START ---
${curriculumContent}
--- CURRICULUM END ---`;
    }

    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
}

export async function sendMessage(message: string): Promise<string> {
    if (!chatSession) {
        startChat('general', null);
    }
    
    if (chatSession) {
        try {
            const response = await chatSession.sendMessage({ message });
            return response.text;
        } catch(error) {
            console.error("Error sending message:", error);
            return "Oops! I'm having a little trouble connecting. Please try again in a moment.";
        }
    }
    return "Chat not started.";
}
