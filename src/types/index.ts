/**
 * @description
 * Defines the shape of the request body sent to the /api/generate endpoint.
 */
export interface HypeGenRequest {
  contentType: "Stream VOD" | "YouTube Video" | "Podcast Episode" | string; // Added string for flexibility if needed
  topic: string;
  highlight: string;
  vibe: "Excited" | "Funny" | "Informative" | "Intriguing" | "Urgent" | string; // Added string for flexibility if needed
}

/**
 * @description
 * Defines the structure of the generated content data returned on success.
 * It's an object where keys are platform identifiers (e.g., 'twitter')
 * and values are tuples containing two string variations [variation1, variation2].
 */
export type HypeGenData = {
  [platform: string]: [string, string];
  // Example structure:
  // twitter: ["Check out my new stream VOD...", "Don't miss this stream VOD..."],
  // youtubeDescription: ["In this video...", "Timestamped highlights..."],
  // shortFormHook: ["Wait till you see this...", "OMG you won't believe..."]
};

/**
 * @description
 * Defines the shape of a successful API response from /api/generate.
 */
export interface HypeGenSuccessResponse {
  success: true;
  data: HypeGenData;
}

/**
 * @description
 * Defines the shape of an error API response from /api/generate.
 */
export interface HypeGenErrorResponse {
  success: false;
  error: string;
}

/**
 * @description
 * Union type representing either a successful or error response from the API.
 */
export type HypeGenResponse = HypeGenSuccessResponse | HypeGenErrorResponse;
