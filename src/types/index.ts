/**
 * @description
 * Defines the shape of the request body sent to the /api/generate endpoint.
 */
export interface HypeGenRequest {
  url: string; // YouTube video URL
  vibe: string; // e.g., "Excited", "Funny", etc.
}

/**
 * @description
 * Defines the structure for a single generated content variation.
 * Topic, hook, description, and tags for one piece of content.
 */
export type HypeGenVariation = {
  topic: string;
  hook: string;
  description: string;
  tags: string[]; // Array of hashtag strings (e.g., ["#palworld", "#gaming"])
};

/**
 * @description
 * Defines the structure of the generated content data returned on success.
 * It's an object where keys are platform identifiers (twitter, instagram, tiktok)
 * and values are arrays containing exactly three HypeGenVariation objects.
 */
export type HypeGenPlatformVariations = {
  // Ensuring specific platforms are keys, each holding an array of 3 variations
  twitter: [HypeGenVariation, HypeGenVariation, HypeGenVariation];
  instagram: [HypeGenVariation, HypeGenVariation, HypeGenVariation];
  tiktok: [HypeGenVariation, HypeGenVariation, HypeGenVariation];
};

/**
 * @description
 * Defines the shape of a successful API response from /api/generate.
 */
export interface HypeGenSuccessResponse {
  success: true;
  data: HypeGenPlatformVariations;
}

/**
 * @description
 * Defines the shape of an error API response from /api/generate.
 */
export interface HypeGenErrorResponse {
  success: false;
  error: string; // Descriptive error message (e.g., "Invalid YouTube URL", "Transcript unavailable")
}

/**
 * @description
 * Union type representing either a successful or error response from the API.
 */
export type HypeGenResponse = HypeGenSuccessResponse | HypeGenErrorResponse;
