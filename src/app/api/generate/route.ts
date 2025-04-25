import { NextRequest, NextResponse } from "next/server";
import type {
  HypeGenRequest,
  HypeGenResponse,
  HypeGenErrorResponse,
  HypeGenSuccessResponse,
  HypeGenPlatformVariations,
  HypeGenVariation,
} from "@/types"; // Using alias @/ based on typical Next.js setup
import { getOpenAIClient } from "@/lib/openai"; // <-- Import OpenAI client utility
import {
  generateTwitterContentPrompt,
  generateInstagramContentPrompt,
  generateTikTokContentPrompt,
} from "@/lib/prompts"; // <-- Import prompt generators
import { extractVideoId, fetchTranscriptAndTitle } from "@/lib/youtube"; // Import youtube utils
import OpenAI from "openai"; // <-- Import OpenAI type for error checking

// Helper function for parsing and validation
const parseAndValidateVariations = (
  platform: string,
  content: string | null | undefined
): [HypeGenVariation, HypeGenVariation, HypeGenVariation] => {
  if (!content) {
    throw new Error(`Missing content from LLM for ${platform}.`);
  }

  console.log(
    `Attempting to parse content for ${platform}:`,
    content.substring(0, 100) + "..."
  ); // Log start of content

  try {
    // Attempt to parse the content as JSON
    const parsed: unknown = JSON.parse(content);

    // Validate structure: must be an array of exactly 3 objects
    if (
      !Array.isArray(parsed) ||
      parsed.length !== 3 ||
      !parsed.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.topic === "string" &&
          typeof item.hook === "string" &&
          typeof item.description === "string" &&
          Array.isArray(item.tags) &&
          item.tags.every((tag: unknown) => typeof tag === "string")
      )
    ) {
      console.error(
        `Validation failed for ${platform}: Invalid structure or content`,
        JSON.stringify(parsed, null, 2)
      );
      throw new Error(
        `Invalid response structure from LLM for ${platform}. Expected JSON array of 3 objects with {topic, hook, description, tags}.`
      );
    }

    // Type assertion is safe here due to the checks above
    console.log(`Successfully parsed and validated response for ${platform}.`);
    return parsed as [HypeGenVariation, HypeGenVariation, HypeGenVariation];
  } catch (e) {
    console.error(
      `Validation failed for ${platform}: JSON parsing error or validation error`,
      e
    );
    if (e instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON format received from LLM for ${platform}. Parsing failed.`
      );
    }
    // Re-throw our custom validation error or other errors
    throw e;
  }
};

/**
 * @description
 * API route handler for generating hype content.
 * Handles POST requests containing content details.
 *
 * @endpoint POST /api/generate
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response object.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<HypeGenResponse>> {
  console.log("Received request for /api/generate (v2)");

  let videoId: string | null = null;
  let transcript: string | undefined;
  let title: string | undefined;
  let vibe: string | undefined;

  try {
    // 1. Parse request body for URL and Vibe
    const body = await request.json();
    const rawUrl = body.url;
    vibe = body.vibe;

    if (typeof rawUrl !== "string" || !rawUrl) {
      throw new Error("Missing or invalid URL in request body.");
    }
    if (typeof vibe !== "string" || !vibe) {
      throw new Error("Missing or invalid Vibe in request body.");
    }
    console.log(`Request parsed: URL=${rawUrl}, Vibe=${vibe}`);

    // 2. Validate URL and Extract Video ID
    videoId = extractVideoId(rawUrl);
    if (!videoId) {
      console.error(`Invalid YouTube URL format: ${rawUrl}`);
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL format provided." },
        { status: 400 }
      );
    }
    console.log(`Extracted Video ID: ${videoId}`);

    // 3. Fetch Transcript and Title
    // Note: Title fetching depends on the library/method used in youtube.ts
    ({ transcript, title } = await fetchTranscriptAndTitle(videoId));
    console.log(`Transcript fetched. Title: ${title || "[Not Available]"}`);

    // ===>>> CONTINUE TO STEP 9 LOGIC (OpenAI calls, parsing, response) <<===
    // Placeholder for now until Step 9 is implemented
    console.warn(
      "API route logic incomplete: OpenAI call and final response generation pending."
    );
    // Temporary response for testing fetch part
    return NextResponse.json(
      {
        success: true, // Temporary success
        message: "Transcript fetched (generation pending)",
        debug: {
          videoId,
          title,
          vibe,
          transcriptLength: transcript?.length,
        },
      } as any,
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error during API processing:", error);
    let errorMessage = "An internal server error occurred.";
    let status = 500;

    if (error instanceof SyntaxError) {
      errorMessage = "Invalid JSON in request body";
      status = 400;
    } else if (error instanceof Error) {
      errorMessage = error.message; // Use error message from thrown errors
      // Adjust status code based on error type if needed (e.g., transcript fetch failure)
      if (
        errorMessage.includes("Invalid YouTube URL") ||
        errorMessage.includes("Invalid video ID")
      ) {
        status = 400;
      } else if (
        errorMessage.includes("disabled transcripts") ||
        errorMessage.includes("No transcript found")
      ) {
        status = 404; // Not Found might be more appropriate here
      } else if (errorMessage.includes("Failed to fetch transcript")) {
        status = 502; // Bad Gateway - upstream error
      } else if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI API Error: ${error.message}`;
        status = error.status || 500;
      }
    }

    const errorResponse: HypeGenErrorResponse = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(errorResponse, { status });
  }
}
