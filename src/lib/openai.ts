import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

/**
 * @description
 * Initializes and returns a singleton instance of the OpenAI client.
 * Retrieves the API key from the environment variable OPENAI_API_KEY.
 *
 * @throws {Error} If the OPENAI_API_KEY environment variable is not set.
 * @returns {OpenAI} The initialized OpenAI client instance.
 */
export function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(
      "FATAL ERROR: OPENAI_API_KEY environment variable is not set."
    );
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please configure it in your .env.local file."
    );
  }

  console.log("Initializing OpenAI client...");
  openaiClient = new OpenAI({ apiKey });
  console.log("OpenAI client initialized successfully.");

  return openaiClient;
}
