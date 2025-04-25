"use client";

import type React from "react";
import { useState } from "react";
import type { HypeGenRequest, HypeGenResponse } from "@/types";
import {
  Select,
  Input,
  Textarea,
  Button,
  Column,
  Spinner,
  Feedback,
  Heading,
} from "@/once-ui/components";
import { ResultCard } from "./ResultCard";

/**
 * @description
 * The main form component for HypeGen (YouTube Content Repurposer).
 * Handles YouTube URL input and vibe selection.
 * Manages state for form fields, loading, errors, and API responses.
 * Orchestrates the API call and displays results via ResultCard components.
 *
 * @component HypeGenForm
 */
export function HypeGenForm() {
  // === State Hooks ===
  const [url, setUrl] = useState<string>(""); // State for YouTube URL
  const [vibe, setVibe] = useState<string>("Excited"); // Keep vibe state

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Ensure apiResponse state expects the NEW HypeGenResponse structure
  const [apiResponse, setApiResponse] = useState<HypeGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // === Options for Vibe Select component ===
  // Removed contentTypeOptions
  const vibeOptions = [
    { value: "Excited", label: "Excited" },
    { value: "Funny", label: "Funny" },
    { value: "Informative", label: "Informative" },
    { value: "Intriguing", label: "Intriguing" },
    { value: "Urgent", label: "Urgent" },
  ];

  // Basic regex for YouTube URL validation (adjust as needed for stricter checks)
  const YOUTUBE_URL_REGEX =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_\-]{11})/;

  // === Form Submission Handler ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("handleSubmit triggered (v2)");

    // 1. Client-Side Validation
    if (!vibe) {
      // Vibe should always have a value due to default
      setError("Please select a vibe.");
      return;
    }
    if (!url.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    if (!YOUTUBE_URL_REGEX.test(url)) {
      setError(
        "Invalid YouTube URL format. Please check the URL and try again."
      );
      return;
    }

    // 2. Reset states and set loading
    setError(null);
    setApiResponse(null);
    setIsLoading(true);
    console.log("Starting API call (v2)...");

    // 3. Construct Payload (matches new HypeGenRequest)
    const payload: HypeGenRequest = { url, vibe };

    // 4. Make API Call (identical to previous implementation, but with new payload)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("API response received, status:", response.status);
      const result: HypeGenResponse = await response.json(); // Expects new HypeGenResponse structure

      if (!response.ok) {
        const errorMessage =
          result.success === false
            ? result.error
            : `Request failed with status ${response.status}`;
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (result.success === false) {
        console.error("API returned logical error:", result.error);
        throw new Error(result.error);
      }

      console.log("API call successful, response:", result);
      setApiResponse(result);
    } catch (err: unknown) {
      console.error("Error during fetch or processing:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setApiResponse(null);
    } finally {
      // 5. Reset loading state
      setIsLoading(false);
      console.log("Finished API call processing (v2).");
    }
  };

  // Helper function to format platform keys into display names (Keep this)
  const formatPlatformName = (key: string): string => {
    switch (key) {
      case "twitter":
        return "Twitter";
      case "instagram":
        return "Instagram"; // Added Instagram
      case "tiktok":
        return "TikTok"; // Added TikTok
      // Remove old cases if they existed
      default:
        return key;
    }
  };

  // === Render ===
  return (
    <Column
      fillWidth
      maxWidth="xl"
      padding="l"
      radius="xl"
      border="neutral-alpha-weak"
      shadow="m"
      background="surface"
      gap="l"
    >
      <Heading as="h2" variant="heading-default-l" align="center">
        Generate YouTube Content Snippets
      </Heading>

      <form onSubmit={handleSubmit} className="w-full">
        <Column fillWidth gap="m">
          {/* YouTube URL Input */}
          <Input
            id="youtube-url"
            label="YouTube Video URL"
            type="url"
            required
            placeholder="e.g., https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            // Let the main error Feedback component handle URL errors now
            // errorMessage={error?.includes('URL') ? error : undefined}
          />

          {/* Target Vibe Select */}
          <Select
            id="vibe"
            label="Target Vibe / Tone"
            required
            value={vibe}
            options={vibeOptions}
            onSelect={setVibe}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            label={isLoading ? "Generating..." : "Generate Content"}
            fillWidth
            arrowIcon
            disabled={isLoading || !url || !YOUTUBE_URL_REGEX.test(url)} // Disable also if URL is invalid format
            variant="primary"
            size="l"
          />
        </Column>
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <Column horizontal="center" paddingY="m">
          <Spinner size="l" />
        </Column>
      )}

      {/* Error Display */}
      {error && (
        <Feedback variant="danger" title="Error" marginTop="m">
          {error}
        </Feedback>
      )}

      {/* Results Section */}
      {apiResponse?.success && (
        <Column fillWidth gap="l" marginTop="l">
          <Heading as="h3" variant="heading-default-l">
            Generated Content
          </Heading>
          {/* Ensure mapping uses the new HypeGenData structure */}
          {Object.entries(apiResponse.data).map(([platformKey, variations]) => (
            <ResultCard
              key={platformKey}
              platformName={formatPlatformName(platformKey)}
              variations={variations} // Pass the variations array directly
            />
          ))}
        </Column>
      )}

      {/* API Error Display */}
      {!apiResponse?.success && apiResponse?.error && (
        <Feedback variant="danger" title="API Error" marginTop="m">
          {apiResponse.error}
        </Feedback>
      )}
    </Column>
  );
}
