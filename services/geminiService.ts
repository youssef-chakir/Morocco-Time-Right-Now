
import { GoogleGenAI } from "@google/genai";
import { GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface TimeData {
    time: string;
    sources: GroundingChunk[];
}

export const fetchMoroccoTime = async (): Promise<TimeData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "What is the current time in Morocco? Only respond with the time and period (e.g., 10:30 AM), nothing else.",
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const time = response.text.trim();
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        if (!time) {
            throw new Error("Failed to get a valid time from the API.");
        }
        
        return { time, sources };

    } catch (error) {
        console.error("Error fetching time from Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch time: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching time.");
    }
};
