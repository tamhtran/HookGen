import type { HypeGenRequest } from "@/types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const JSON_OUTPUT_INSTRUCTION =
  'You MUST provide your response as a valid JSON array containing exactly two distinct strings, like this: ["variation 1", "variation 2"]. Do not include any other text, explanations, or markdown formatting outside of this JSON array.';

/**
 * @description
 * Generates the message array for the OpenAI API call to create Twitter post variations.
 *
 * @param {HypeGenRequest} requestData - The user's input data.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateTwitterPromptMessages(
  requestData: HypeGenRequest
): ChatCompletionMessageParam[] {
  const { contentType, topic, highlight, vibe } = requestData;

  const systemPrompt = `You are an expert social media manager specializing in Twitter engagement for content creators. Your task is to generate promotional tweet text. Adhere strictly to the following requirements:
1. Generate TWO distinct variations of a tweet.
2. Each tweet MUST be concise and under 280 characters.
3. Incorporate relevant emojis (1-3) and popular hashtags (2-4).
4. Adopt an "${vibe}" tone.
5. Focus on the main topic: "${topic}".
6. Emphasize the key highlight: "${highlight}".
7. The content type is: "${contentType}".
8. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Content Type: ${contentType}
Topic: ${topic}
Highlight: ${highlight}
Vibe: ${vibe}

Generate two distinct Twitter post variations based on these details, following all instructions precisely, especially the JSON output format.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

/**
 * @description
 * Generates the message array for the OpenAI API call to create YouTube description variations.
 *
 * @param {HypeGenRequest} requestData - The user's input data.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateYoutubePromptMessages(
  requestData: HypeGenRequest
): ChatCompletionMessageParam[] {
  const { contentType, topic, highlight, vibe } = requestData;

  const systemPrompt = `You are an expert content strategist specializing in YouTube video descriptions. Your task is to generate promotional text suitable for a YouTube video description or a Twitch stream summary. Adhere strictly to the following requirements:
1. Generate TWO distinct variations of the description text.
2. Each description should be engaging and informative, encouraging clicks/views (around 2-4 sentences long).
3. Include relevant keywords but avoid excessive hashtags within the main text (hashtags can be suggested separately if natural).
4. Adopt an "${vibe}" tone.
5. Focus on the main topic: "${topic}".
6. Emphasize the key highlight: "${highlight}".
7. The content type is: "${contentType}".
8. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Content Type: ${contentType}
Topic: ${topic}
Highlight: ${highlight}
Vibe: ${vibe}

Generate two distinct YouTube/Twitch description variations based on these details, following all instructions precisely, especially the JSON output format.`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

/**
 * @description
 * Generates the message array for the OpenAI API call to create short-form video hook variations.
 *
 * @param {HypeGenRequest} requestData - The user's input data.
 * @returns {ChatCompletionMessageParam[]} An array of messages for the OpenAI API.
 */
export function generateShortsPromptMessages(
  requestData: HypeGenRequest
): ChatCompletionMessageParam[] {
  const { contentType, topic, highlight, vibe } = requestData;

  const systemPrompt = `You are a viral content expert specializing in short-form video hooks (like for YouTube Shorts, TikTok, Instagram Reels). Your task is to generate compelling hooks to capture immediate attention. Adhere strictly to the following requirements:
1. Generate TWO distinct variations of a short, punchy hook (ideally under 100 characters, focus on impact).
2. Incorporate relevant emojis (1-2) if they fit the vibe.
3. Adopt an "${vibe}" tone.
4. Hint at the main topic: "${topic}".
5. Strongly emphasize the key highlight/hook: "${highlight}".
6. The original content type is: "${contentType}".
7. ${JSON_OUTPUT_INSTRUCTION}`;

  const userPrompt = `Content Type: ${contentType}
Topic: ${topic}
Highlight: ${highlight}
Vibe: ${vibe}

Generate two distinct short-form video hook variations based on these details, following all instructions precisely, especially the JSON output format. Make them very catchy!`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}
