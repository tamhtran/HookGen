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
import { parseAndValidateVariations } from "@/lib/validation"; // <-- Import from new location
import OpenAI from "openai"; // <-- Import OpenAI type for error checking

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

    // 4. Prepare for OpenAI Calls
    if (!transcript) {
      // Should have been caught earlier, but double-check
      throw new Error("Transcript is missing, cannot proceed.");
    }
    const openai = getOpenAIClient();
    const commonParams = { transcript, title, vibe };
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo-0125"; // Or your preferred model
    console.log(`Using OpenAI model: ${model}`);

    // 5. Call OpenAI API for each platform concurrently
    console.log("Starting parallel OpenAI calls for all platforms...");
    const [twitterResult, instagramResult, tiktokResult] =
      await Promise.allSettled([
        openai.chat.completions.create({
          model: model,
          messages: generateTwitterContentPrompt(commonParams),
          response_format: { type: "json_object" }, // Ensure JSON output is requested
          temperature: 0.7, // Adjust creativity
        }),
        openai.chat.completions.create({
          model: model,
          messages: generateInstagramContentPrompt(commonParams),
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
        openai.chat.completions.create({
          model: model,
          messages: generateTikTokContentPrompt(commonParams),
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      ]);
    console.log("All OpenAI calls finished.");

    /* --- DEBUG: Log raw response and exit (COMMENTED OUT) ---
    if (tiktokResult.status === 'fulfilled') {
      const rawContent = tiktokResult.value.choices[0]?.message?.content;
      console.log("--- RAW TIKTOK RESPONSE START ---");
      console.log(rawContent);
      console.log("--- RAW TIKTOK RESPONSE END ---");

      // Return a temporary response indicating success but showing raw data
      return NextResponse.json({ 
        success: true, // Indicate API call itself was okay
        debug_message: "Returning raw content for debugging.",
        raw_content: rawContent 
      } as any, { status: 200 }); // <-- Cast to any to satisfy linter during debug

    } else {
      // Handle case where the OpenAI call itself failed
      console.error('TikTok generation failed (OpenAI API error):', tiktokResult.reason);
      throw new Error(`OpenAI API call failed for TikTok: ${tiktokResult.reason.message || tiktokResult.reason}`);
    }
    --- END DEBUG SECTION --- */

    // --- Original processing logic (UNCOMMENTED) ---
    // 6. Process results and handle potential errors
    // Initialize for all platforms
    const responseData: HypeGenPlatformVariations = {
      twitter: undefined as any, // Placeholder
      instagram: undefined as any, // Placeholder
      tiktok: undefined as any, // Placeholder
    };

    // Process Twitter results
    if (twitterResult.status === "fulfilled") {
      console.log("Processing Twitter response...");
      const content = twitterResult.value.choices[0]?.message?.content;
      responseData.twitter = parseAndValidateVariations("twitter", content);
    } else {
      console.error("Twitter generation failed:", twitterResult.reason);
      throw new Error(
        `Failed to generate content for Twitter: ${
          twitterResult.reason.message || twitterResult.reason
        }`
      );
    }

    // Process Instagram results
    if (instagramResult.status === "fulfilled") {
      console.log("Processing Instagram response...");
      const content = instagramResult.value.choices[0]?.message?.content;
      responseData.instagram = parseAndValidateVariations("instagram", content);
    } else {
      console.error("Instagram generation failed:", instagramResult.reason);
      throw new Error(
        `Failed to generate content for Instagram: ${
          instagramResult.reason.message || instagramResult.reason
        }`
      );
    }

    // Process TikTok results
    if (tiktokResult.status === "fulfilled") {
      console.log("Processing TikTok response...");
      const content = tiktokResult.value.choices[0]?.message?.content;
      responseData.tiktok = parseAndValidateVariations("tiktok", content);
    } else {
      console.error("TikTok generation failed:", tiktokResult.reason);
      throw new Error(
        `Failed to generate content for TikTok: ${
          tiktokResult.reason.message || tiktokResult.reason
        }`
      );
    }

    // 7. Send final successful response (now includes all platforms)
    const successResponse: HypeGenSuccessResponse = {
      success: true,
      data: responseData, // No cast needed now
    };
    console.log("Generation successful for all platforms. Sending response.");
    return NextResponse.json(successResponse, { status: 200 });
    // --- End Original processing logic ---
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
