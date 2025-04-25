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
 * The main form component for HypeGen.
 * Handles user input, manages state for form fields, loading, errors, and API responses.
 * It will orchestrate the API call and display results (delegating to ResultCard later).
 *
 * @component HypeGenForm
 */
export function HypeGenForm() {
  // === State Hooks ===
  const [contentType, setContentType] = useState<string>(""); // e.g., "YouTube Video"
  const [topic, setTopic] = useState<string>(""); // e.g., "My First Look at Palworld"
  const [highlight, setHighlight] = useState<string>(""); // e.g., "Caught a legendary Pal!"
  const [vibe, setVibe] = useState<string>("Excited"); // Default vibe as per tech spec

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<HypeGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // === Options for Select components ===
  const contentTypeOptions = [
    { value: "Stream VOD", label: "Stream VOD" },
    { value: "YouTube Video", label: "YouTube Video" },
    { value: "Podcast Episode", label: "Podcast Episode" },
  ];

  const vibeOptions = [
    { value: "Excited", label: "Excited" },
    { value: "Funny", label: "Funny" },
    { value: "Informative", label: "Informative" },
    { value: "Intriguing", label: "Intriguing" },
    { value: "Urgent", label: "Urgent" },
  ];

  // === Form Submission Handler ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default page reload
    console.log("handleSubmit triggered");

    // 1. Basic Client-Side Validation
    if (!contentType || !topic.trim() || !highlight.trim() || !vibe) {
      console.error("Validation failed", {
        contentType,
        topic,
        highlight,
        vibe,
      });
      setError("Please fill in all required fields.");
      setApiResponse(null); // Clear previous results if validation fails
      return;
    }

    // 2. Reset states and set loading
    setError(null);
    setApiResponse(null);
    setIsLoading(true);
    console.log("Starting API call...");

    // 3. Construct Payload
    const payload: HypeGenRequest = {
      contentType,
      topic,
      highlight,
      vibe,
    };

    // 4. Make API Call
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("API response received, status:", response.status);
      const result: HypeGenResponse = await response.json();

      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx)
        // Use error message from API response if available
        const errorMessage =
          result.success === false
            ? result.error
            : `Request failed with status ${response.status}`;
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Handle potential logical errors returned in a 200 OK response
      if (result.success === false) {
        console.error("API returned logical error:", result.error);
        throw new Error(result.error);
      }

      // Success Case
      console.log("API call successful, response:", result);
      setApiResponse(result);
    } catch (err: unknown) {
      console.error("Error during fetch or processing:", err);
      if (err instanceof Error) {
        setError(err.message); // Set error message from caught error
      } else {
        setError("An unexpected error occurred. Please try again."); // Fallback error
      }
      setApiResponse(null); // Clear response data on error
    } finally {
      // 5. Reset loading state regardless of outcome
      setIsLoading(false);
      console.log("Finished API call processing.");
    }
  };

  // Helper function to format platform keys into display names
  const formatPlatformName = (key: string): string => {
    switch (key) {
      case "twitter":
        return "Twitter";
      case "youtubeDescription":
        return "YouTube / Twitch Description";
      case "shortFormHook":
        return "Short-form Video Hook";
      default:
        return key; // Fallback to the key itself
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
        Generate Promo Snippets
      </Heading>

      <form onSubmit={handleSubmit} className="w-full">
        <Column fillWidth gap="m">
          <Select
            id="content-type"
            label="Content Type"
            required
            placeholder="Select Content Type..."
            value={contentType}
            options={contentTypeOptions}
            onSelect={setContentType}
          />

          <Input
            id="topic"
            label="Main Topic / Title"
            required
            placeholder="e.g., My First Look at Palworld"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Textarea
            id="highlight"
            label="Key Highlight / Hook"
            required
            lines={3}
            placeholder="e.g., Caught a legendary Pal!"
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
          />

          <Select
            id="vibe"
            label="Target Vibe / Tone"
            required
            value={vibe}
            options={vibeOptions}
            onSelect={setVibe}
          />

          <Button
            type="submit"
            label={isLoading ? "Generating..." : "Generate Snippets"}
            fillWidth
            arrowIcon
            disabled={isLoading}
            variant="primary"
            size="l"
          />
        </Column>
      </form>

      {isLoading && (
        <Column horizontal="center" paddingY="m">
          <Spinner size="l" />
        </Column>
      )}

      {error && (
        <Feedback variant="danger" title="Error" marginTop="m">
          {error}
        </Feedback>
      )}

      {apiResponse?.success && (
        <Column fillWidth gap="l" marginTop="l">
          <Heading as="h3" variant="heading-default-l">
            Generated Content
          </Heading>
          {Object.entries(apiResponse.data).map(([platformKey, variations]) => (
            <ResultCard
              key={platformKey}
              platformName={formatPlatformName(platformKey)}
              variations={variations}
            />
          ))}
        </Column>
      )}
      {!apiResponse?.success && apiResponse?.error && (
        <Feedback variant="danger" title="API Error" marginTop="m">
          {apiResponse.error}
        </Feedback>
      )}
    </Column>
  );
}
