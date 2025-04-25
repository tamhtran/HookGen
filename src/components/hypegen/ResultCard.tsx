"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  Heading,
  Column, // Using Column for content layout
  Text, // For placeholder
  SegmentedControl, // <-- Import SegmentedControl
  Row, // <-- Import Row for layout
  IconButton, // <-- Import IconButton
  useToast, // <-- Import useToast
} from "@/once-ui/components";
import type { HypeGenVariation } from "@/types"; // <-- Import the new variation type

/**
 * @description
 * Interface defining the props for the ResultCard component.
 */
export interface ResultCardProps {
  platformName: string;
  // Expect an array of 3 HypeGenVariation objects
  variations: [HypeGenVariation, HypeGenVariation, HypeGenVariation];
}

/**
 * @description
 * A component to display the generated content variations for a specific platform.
 * Uses SegmentedControl for 3 variations, displays topic, hook, description, tags.
 *
 * @component ResultCard
 * @param {ResultCardProps} props - The props for the component.
 */
export function ResultCard({ platformName, variations }: ResultCardProps) {
  // State to track which variation is selected (0, 1, or 2)
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<
    0 | 1 | 2
  >(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { addToast } = useToast();

  // Define buttons for 3 variations
  const variationButtons = [
    { value: "v1", label: "Variation 1" },
    { value: "v2", label: "Variation 2" },
    { value: "v3", label: "Variation 3" },
  ];

  // Handle toggle event for 3 variations
  const handleToggle = (value: string) => {
    let index: 0 | 1 | 2 = 0;
    if (value === "v2") index = 1;
    else if (value === "v3") index = 2;
    setSelectedVariationIndex(index);
    setIsCopied(false); // Reset copied state when variation changes
  };

  // --- Copy Handler ---
  const handleCopy = async () => {
    const { topic, hook, description, tags } =
      variations[selectedVariationIndex];

    // Format tags with a leading '#' and join them
    const formattedTags = tags
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(" ");

    // Construct the full text string
    const textToCopy = `Topic: ${topic}

Hook: ${hook}

${description}

Tags: ${formattedTags}`;

    console.log("Attempting to copy full content:", textToCopy);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      addToast({ variant: "success", message: "Full content copied!" }); // Updated message
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      addToast({ variant: "danger", message: "Failed to copy content" }); // Updated message
      setIsCopied(false);
    }
  };
  // ---------------------

  // Get the currently selected variation object
  const selectedVariation = variations[selectedVariationIndex];

  // Character count logic needs update based on which field to count (e.g., description)
  const isTwitter = platformName === "Twitter";
  const descriptionLength = selectedVariation.description.length;
  const twitterLimit = 280;
  const exceedsLimit = isTwitter && descriptionLength > twitterLimit;

  return (
    <Card fillWidth background="surface" border="neutral-alpha-weak" radius="l">
      <Column padding="l" gap="m">
        <Heading as="h3" variant="heading-default-m">
          {platformName}
        </Heading>

        {/* Segmented Control for 3 variations */}
        <SegmentedControl
          buttons={variationButtons}
          onToggle={handleToggle}
          fillWidth
        />

        {/* Display Content for Selected Variation */}
        <Column gap="s" marginTop="m">
          {" "}
          {/* Column for content spacing */}
          <Heading as="h4" variant="heading-strong-s">
            {" "}
            {/* Topic */}
            Topic: {selectedVariation.topic}
          </Heading>
          <Text variant="body-strong-m" onBackground="neutral-strong">
            {" "}
            {/* Hook */}
            Hook: {selectedVariation.hook}
          </Text>
          <Text
            onBackground="neutral-strong"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {" "}
            {/* Description */}
            {selectedVariation.description}
          </Text>
          {/* Tags Display */}
          {selectedVariation.tags && selectedVariation.tags.length > 0 && (
            <Row wrap gap="xs" marginTop="s">
              {selectedVariation.tags.map((tag, index) => (
                <Text
                  key={index}
                  size="xs"
                  paddingX="s"
                  paddingY="2"
                  onBackground="neutral-strong"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </Text>
              ))}
            </Row>
          )}
        </Column>

        {/* Bottom Row: Character Count & Copy Button */}
        <Row
          fillWidth
          horizontal="space-between"
          vertical="center"
          gap="m"
          marginTop="m"
        >
          {/* Character Count (for Twitter description) */}
          {isTwitter ? (
            <Text
              size="xs"
              onBackground={exceedsLimit ? "danger-medium" : "neutral-weak"}
            >
              Description: {descriptionLength} / {twitterLimit} characters
            </Text>
          ) : (
            <div /> /* Keep space consistent */
          )}

          {/* Copy Button */}
          <IconButton
            icon={isCopied ? "check" : "clipboard"}
            onClick={handleCopy}
            variant="tertiary"
            tooltip={isCopied ? "Copied!" : "Copy full content"} // Updated tooltip
            size="m"
          />
        </Row>
      </Column>
    </Card>
  );
}
