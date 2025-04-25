import { NextRequest, NextResponse } from "next/server";
import type {
  HypeGenRequest,
  HypeGenResponse,
  HypeGenErrorResponse,
  HypeGenSuccessResponse,
  HypeGenData,
} from "@/types"; // Using alias @/ based on typical Next.js setup
import { getOpenAIClient } from "@/lib/openai"; // <-- Import OpenAI client utility
import {
  generateTwitterPromptMessages,
  generateYoutubePromptMessages,
  generateShortsPromptMessages,
} from "@/lib/prompts"; // <-- Import prompt generators
import OpenAI from "openai"; // <-- Import OpenAI type for error checking

// Helper function for parsing and validation
const parseAndValidateVariations = (
  platform: string,
  content: string | null | undefined
): [string, string] => {
  if (!content) {
    throw new Error(`Missing content from LLM for ${platform}.`);
  }

  try {
    const parsed = JSON.parse(content);

    if (
      !Array.isArray(parsed) ||
      parsed.length !== 2 ||
      typeof parsed[0] !== "string" ||
      typeof parsed[1] !== "string"
    ) {
      console.error(
        `Validation failed for ${platform}: Invalid structure`,
        parsed
      );
      throw new Error(
        `Invalid response structure from LLM for ${platform}. Expected JSON array of two strings.`
      );
    }
    // Type assertion is safe here due to the checks above
    return parsed as [string, string];
  } catch (e) {
    console.error(`Validation failed for ${platform}: JSON parsing error`, e);
    // Re-throw parsing errors or structure validation errors
    if (e instanceof SyntaxError) {
      throw new Error(`Invalid JSON format received from LLM for ${platform}.`);
    }
    // Re-throw our custom validation error
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
  console.log("Received request for /api/generate"); // Basic logging

  try {
    // 1. Parse request body
    const body = await request.json();
    console.log("Request body parsed:", body);

    // 2. Validate input (basic required fields for now)
    // We cast to HypeGenRequest after basic checks or use a validation library later
    const { topic, highlight, contentType, vibe } =
      body as Partial<HypeGenRequest>; // Use Partial initially

    // Basic validation (can be expanded)
    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      console.error("Validation failed: Missing or invalid topic");
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: "Missing required field: topic",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (
      !highlight ||
      typeof highlight !== "string" ||
      highlight.trim() === ""
    ) {
      console.error("Validation failed: Missing or invalid highlight");
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: "Missing required field: highlight",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    if (
      !contentType ||
      typeof contentType !== "string" ||
      contentType.trim() === ""
    ) {
      console.error("Validation failed: Missing or invalid contentType");
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: "Missing required field: contentType",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    if (!vibe || typeof vibe !== "string" || vibe.trim() === "") {
      console.error("Validation failed: Missing or invalid vibe");
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: "Missing required field: vibe",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Type assertion now that basic checks passed
    const validatedBody = body as HypeGenRequest;
    console.log("Request body validated:", validatedBody);

    // 3. Initialize OpenAI Client
    const openai = getOpenAIClient();
    console.log("OpenAI client obtained.");

    // 4. Generate prompts for each platform
    const twitterMessages = generateTwitterPromptMessages(validatedBody);
    const youtubeMessages = generateYoutubePromptMessages(validatedBody);
    const shortsMessages = generateShortsPromptMessages(validatedBody);
    console.log("Prompts generated for all platforms.");

    // 5. Make parallel API calls to OpenAI
    const model = "gpt-4o"; // Or "gpt-3.5-turbo"
    const temperature = 0.7;

    console.log(
      `Starting parallel OpenAI calls with model: ${model}, temp: ${temperature}`
    );

    const [twitterResult, youtubeResult, shortsResult] = await Promise.all([
      openai.chat.completions.create({
        model: model,
        messages: twitterMessages,
        temperature: temperature,
        // response_format: { type: "json_object" }, // Enforcing JSON output - Revisit if needed in Step 9
      }),
      openai.chat.completions.create({
        model: model,
        messages: youtubeMessages,
        temperature: temperature,
        // response_format: { type: "json_object" },
      }),
      openai.chat.completions.create({
        model: model,
        messages: shortsMessages,
        temperature: temperature,
        // response_format: { type: "json_object" },
      }),
    ]);

    console.log("OpenAI API calls completed.");

    // 6. Parse and Validate LLM Responses
    console.log("Parsing and validating LLM responses...");

    const twitterContent = twitterResult.choices[0]?.message?.content;
    const youtubeContent = youtubeResult.choices[0]?.message?.content;
    const shortsContent = shortsResult.choices[0]?.message?.content;

    // Use helper function within a try...catch block for overall parsing validation
    let twitterVariations: [string, string];
    let youtubeVariations: [string, string];
    let shortsVariations: [string, string];

    try {
      twitterVariations = parseAndValidateVariations("Twitter", twitterContent);
      youtubeVariations = parseAndValidateVariations("YouTube", youtubeContent);
      shortsVariations = parseAndValidateVariations("Shorts", shortsContent);
      console.log("LLM responses parsed and validated successfully.");
    } catch (parsingError) {
      // Log the specific parsing error
      console.error("LLM Response Parsing/Validation Error:", parsingError);
      // Return a 500 error indicating failure to process LLM response
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error:
          parsingError instanceof Error
            ? parsingError.message
            : "Failed to parse or validate response from LLM.",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // 7. Construct Final Success Response
    const responseData: HypeGenData = {
      twitter: twitterVariations,
      youtubeDescription: youtubeVariations,
      shortFormHook: shortsVariations,
    };

    const successResponse: HypeGenSuccessResponse = {
      success: true,
      data: responseData,
    };

    console.log("Returning final successful response.");
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error during generation process:", error);

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: "Invalid JSON in request body",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error(
        "OpenAI API Error:",
        error.status,
        error.name,
        error.message
      );
      const errorResponse: HypeGenErrorResponse = {
        success: false,
        error: `OpenAI API Error: ${error.message}`,
      };
      // Use status from OpenAI error if available, otherwise default to 500
      return NextResponse.json(errorResponse, { status: error.status || 500 });
    }

    // Generic internal server error for other issues
    const errorResponse: HypeGenErrorResponse = {
      success: false,
      error: "Internal Server Error occurred during generation.",
    };
    // Check if error is an instance of Error to safely access message
    if (error instanceof Error) {
      errorResponse.error = `Internal Server Error: ${error.message}`;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
