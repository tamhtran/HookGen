import type { HypeGenRequest } from "@/types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { HypeGenVariation } from "@/types";

// Define the structure we expect OpenAI to return in the JSON array
const EXPECTED_JSON_STRUCTURE_DESCRIPTION = `Each object in the array must have the following structure: { "topic": string, "hook": string, "description": string, "tags": string[] }`;

// Define the standard JSON output instruction, requesting an array of 3 variations
const JSON_OUTPUT_INSTRUCTION = `You MUST provide your response as a valid JSON array containing exactly THREE distinct objects, like this: [ {variation1}, {variation2}, {variation3} ]. ${EXPECTED_JSON_STRUCTURE_DESCRIPTION}. Do not include any other text, explanations, or markdown formatting outside of this JSON array.`;

// Interface for the data needed by the prompt generator
interface PromptGenerationParams {
  transcript: string;
  title?: string; // Title is optional as it might not be available
  vibe: string;
}

/**
 * @description
 * Generates the message array for creating Twitter content variations based on a transcript.
 *
 * @param {PromptGenerationParams} params - The transcript, optional title, and vibe.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateTwitterContentPrompt({
  transcript,
  title,
  vibe,
}: PromptGenerationParams): ChatCompletionMessageParam[] {
  const systemPrompt = `You are an expert social media manager specializing in Twitter engagement for content creators. Analyze the following video transcript${
    title ? ` (titled: \"${title}\")` : ""
  } and generate promotional content. Adhere strictly to the following requirements:
1. Generate THREE distinct variations.
2. Each variation MUST include: a concise topic (string), a compelling hook (string), a tweet description (string, under 280 chars), and relevant hashtags (string array, 2-4 tags).
3. The tweet description should incorporate relevant emojis (1-3).
4. Adopt an "${vibe}" tone throughout all generated content.
5. Base the content SOLELY on the provided transcript and title.
6. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Video Title: ${title || "[Not Provided]"}
Vibe: ${vibe}
Transcript:
--- BEGIN TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---

Generate three distinct variations for a Twitter promotion based *only* on these details, following all instructions precisely, especially the JSON output format.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

/**
 * @description
 * Generates the message array for creating Instagram content variations based on a transcript.
 *
 * @param {PromptGenerationParams} params - The transcript, optional title, and vibe.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateInstagramContentPrompt({
  transcript,
  title,
  vibe,
}: PromptGenerationParams): ChatCompletionMessageParam[] {
  const systemPrompt = `You are an expert social media strategist specializing in Instagram content for creators. Analyze the following video transcript${
    title ? ` (titled: \"${title}\")` : ""
  } and generate promotional content suitable for an Instagram post caption. Adhere strictly to the following requirements:
1. Generate THREE distinct variations.
2. Each variation MUST include: a concise topic (string), an engaging hook (string, first sentence ideally), a descriptive caption (string, ~2-5 sentences), and relevant hashtags (string array, 5-10 tags).
3. The caption should be well-formatted (e.g., paragraph breaks) and may include relevant emojis (2-5).
4. Adopt an "${vibe}" tone throughout all generated content.
5. Base the content SOLELY on the provided transcript and title.
6. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Video Title: ${title || "[Not Provided]"}
Vibe: ${vibe}
Transcript:
--- BEGIN TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---

Generate three distinct variations for an Instagram promotion based *only* on these details, following all instructions precisely, especially the JSON output format.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

/**
 * @description
 * Generates the message array for creating TikTok content variations based on a transcript.
 *
 * @param {PromptGenerationParams} params - The transcript, optional title, and vibe.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateTikTokContentPrompt({
  transcript,
  title,
  vibe,
}: PromptGenerationParams): ChatCompletionMessageParam[] {
  const systemPrompt = `You are a viral content expert specializing in TikTok video descriptions and ideas. Analyze the following video transcript${
    title ? ` (titled: \"${title}\")` : ""
  } and generate promotional content ideas. Adhere strictly to the following requirements:
1. Generate THREE distinct variations.
2. Each variation MUST include: a very short topic/theme (string), a super catchy hook (string, <100 chars, designed for immediate attention), a brief video description/caption (string, 1-2 sentences max), and trending/relevant hashtags (string array, 3-5 tags).
3. Incorporate relevant emojis (1-3) in the hook or description.
4. Adopt an "${vibe}" tone, suitable for TikTok.
5. Base the content SOLELY on the provided transcript and title.
6. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Video Title: ${title || "[Not Provided]"}
Vibe: ${vibe}
Transcript:
--- BEGIN TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---

Generate three distinct variations for a TikTok promotion based *only* on these details, following all instructions precisely, especially the JSON output format. Make the hooks extremely catchy!`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

// We can add a general function if needed, but specific ones might allow better tuning.
// export function generatePlatformContentPrompt(
//   platform: 'twitter' | 'instagram' | 'tiktok',
//   params: PromptGenerationParams
// ): ChatCompletionMessageParam[] {
//   switch (platform) {
//     case 'twitter': return generateTwitterContentPrompt(params);
//     case 'instagram': return generateInstagramContentPrompt(params);
//     case 'tiktok': return generateTikTokContentPrompt(params);
//   }
// }
