import { getOpenAIClient } from "@/lib/openai";
import { generateTikTokContentPrompt } from "@/lib/prompts";
import { parseAndValidateVariations } from "@/lib/validation";
import type { HypeGenVariation } from "@/types";

// Use the same sample data as the script
const sampleTranscript = `
Hello everyone, welcome back! Today we're diving deep into the world of prompt engineering.
It's a crucial skill for getting the most out of large language models like GPT-4.
First, let's talk about clarity. Be specific! Don't just say 'write a story', say 'write a short story about a lost robot searching for its creator in a futuristic city'.
Context is key. Provide background information. If you want marketing copy, mention the target audience and the product's unique selling points.
We'll also cover iterative refinement. Your first prompt might not be perfect. Analyze the output, see what's missing, and tweak your prompt accordingly. Ask the model to critique its own response!
Finally, experiment with different phrasings and keywords. Sometimes a small change can yield vastly different results. Okay, let's look at some examples...
`;
const sampleVibe = "Informative";
const sampleTitle = "Mastering Prompt Engineering"; // Optional title
const modelToUse = process.env.OPENAI_MODEL || "gpt-3.5-turbo-0125";

describe("OpenAI TikTok Content Generation", () => {
  it("should fetch and validate 3 TikTok variations from OpenAI", async () => {
    // Check if API key is present (basic guard)
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "Missing OPENAI_API_KEY environment variable for testing."
      );
    }

    console.log(`Starting TikTok OpenAI test via Jest...`);
    console.log(`Using Model: ${modelToUse}`);

    const openai = getOpenAIClient();
    const messages = generateTikTokContentPrompt({
      transcript: sampleTranscript,
      title: sampleTitle,
      vibe: sampleVibe,
    });

    // Basic check on prompt generation
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");

    console.log("Sending request to OpenAI via Jest...");

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    console.log("Received response from OpenAI via Jest.");

    const rawContent = completion.choices[0]?.message?.content;

    // Log raw content for debugging if needed
    // console.log("--- RAW RESPONSE CONTENT START ---");
    // console.log(rawContent);
    // console.log("--- RAW RESPONSE CONTENT END ---");

    expect(rawContent).toBeDefined();
    expect(typeof rawContent).toBe("string");
    expect(rawContent).not.toBeNull();
    expect(rawContent!.length).toBeGreaterThan(0);

    // Attempt parsing and validation
    let parsedData:
      | [HypeGenVariation, HypeGenVariation, HypeGenVariation]
      | null = null;
    let parseError: Error | null = null;

    try {
      if (rawContent) {
        parsedData = parseAndValidateVariations("tiktok (jest)", rawContent);
      }
    } catch (error: any) {
      console.error("Raw content that failed parsing:", rawContent);
      parseError = error;
    }

    // Assert that parsing did NOT fail (the core issue we were debugging)
    expect(parseError).toBeNull();

    // Assert that we received parsed data
    expect(parsedData).not.toBeNull();

    // Assert the structure of the parsed data
    expect(Array.isArray(parsedData)).toBe(true);
    expect(parsedData).toHaveLength(3);

    // Check structure of each variation
    parsedData?.forEach((variation, index) => {
      console.log(`Validating Variation ${index + 1}`);
      expect(variation).toHaveProperty("topic");
      expect(typeof variation.topic).toBe("string");
      expect(variation).toHaveProperty("hook");
      expect(typeof variation.hook).toBe("string");
      expect(variation).toHaveProperty("description");
      expect(typeof variation.description).toBe("string");
      expect(variation).toHaveProperty("tags");
      expect(Array.isArray(variation.tags)).toBe(true);
      variation.tags.forEach((tag) => expect(typeof tag).toBe("string"));
    });

    console.log("✅ Jest test completed successfully.");
  });
});
