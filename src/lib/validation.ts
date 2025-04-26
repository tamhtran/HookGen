import type { HypeGenVariation } from "@/types";

/**
 * @description
 * Helper function for parsing and validating the structured response from OpenAI.
 * Ensures the response is a JSON array containing exactly three valid HypeGenVariation objects.
 * @param {string} platform - The platform identifier (for logging purposes).
 * @param {string | null | undefined} content - The raw string content from the LLM response.
 * @returns {[HypeGenVariation, HypeGenVariation, HypeGenVariation]} The validated array of variations.
 * @throws {Error} If content is missing, JSON is invalid, or structure doesn't match expectations.
 */

// Type for the expected root object structure
interface OpenAIResponseObject {
  variations: HypeGenVariation[];
}

export const parseAndValidateVariations = (
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
    const parsed: unknown = JSON.parse(content);

    // Validate that the root is an object with a 'variations' key which is an array
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("variations" in parsed) ||
      !Array.isArray((parsed as OpenAIResponseObject).variations)
    ) {
      console.error(
        `Validation failed for ${platform}: Root structure is not { variations: [...] }`,
        JSON.stringify(parsed, null, 2)
      );
      throw new Error(
        `Invalid root structure from LLM for ${platform}. Expected { variations: [...] }.`
      );
    }

    // Extract the variations array
    const variationsArray = (parsed as OpenAIResponseObject).variations;

    // Now, validate the variationsArray structure (length and content)
    if (
      variationsArray.length !== 3 ||
      !variationsArray.every(
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
        `Validation failed for ${platform}: Invalid structure or content within the 'variations' array`,
        JSON.stringify(variationsArray, null, 2)
      );
      throw new Error(
        `Invalid response structure from LLM for ${platform}. Expected 'variations' array to contain 3 valid objects.`
      );
    }

    console.log(`Successfully parsed and validated response for ${platform}.`);
    // Type assertion is safe here due to the checks above
    return variationsArray as [
      HypeGenVariation,
      HypeGenVariation,
      HypeGenVariation
    ];
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
