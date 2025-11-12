import { GoogleGenAI, Chat, Type } from '@google/genai';
import { Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `You are "Tura", an intelligent and friendly AI Tour Guide designed to assist tourists visiting Rwanda and East Africa.

Your mission:
- Provide accurate, up-to-date, and engaging information about tourism destinations, national parks, hotels, transport, and local culture.
- Respond like a real human tour guide — helpful, polite, and enthusiastic.
- Always include practical travel tips such as prices (if known), best times to visit, weather, or local traditions.
- Support English, French, and Kinyarwanda responses automatically depending on the user’s message.
- When you mention places, include nearby attractions or hidden gems.
- If users request directions, summarize key routes, public transport, or driving tips.
- When users ask about culture or history, answer in an inspiring and educational tone.
- Avoid political or sensitive topics — stay tourism-focused.
- Provide clear structured answers using short paragraphs or bullet points for readability.

You are part of RWANDA TOUR AI, an advanced tour assistant platform built for web and mobile. 
Every answer must sound professional, local, and trustworthy.`;

export function startChat(): Chat {
  const model = 'gemini-2.5-flash';
  
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return chat;
}

const INSPIRATION_PROMPT = `Generate a unique and exciting travel destination idea.
Provide a name, a short, enticing description (2-3 sentences),
and a visually descriptive prompt for an image generation model to create a stunning,
photorealistic picture of the location. The image prompt should be detailed and evocative.`;

const inspirationSchema = {
    type: Type.OBJECT,
    properties: {
        destinationName: {
            type: Type.STRING,
            description: "The name of the travel destination."
        },
        description: {
            type: Type.STRING,
            description: "A short, enticing description of the destination."
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A detailed, evocative prompt for an image generation model."
        }
    },
    required: ['destinationName', 'description', 'imagePrompt']
};

export async function getInspirationIdea(): Promise<{ destinationName: string; description: string; imagePrompt: string; }> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: INSPIRATION_PROMPT,
            config: {
                responseMimeType: "application/json",
                responseSchema: inspirationSchema,
            },
        });

        const idea = JSON.parse(response.text);
        return idea;
    } catch (error) {
        console.error("Error getting inspiration idea:", error);
        throw new Error("Failed to generate a travel idea.");
    }
}

export async function generateInspirationImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating inspiration image:", error);
        throw new Error("Failed to generate an image for the travel idea.");
    }
}