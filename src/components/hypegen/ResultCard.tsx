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

/**
 * @description
 * Interface defining the props for the ResultCard component.
 */
export interface ResultCardProps {
  /** The name of the platform (e.g., "Twitter", "YouTube Description") */
  platformName: string;
  /** An array containing two string variations of the generated content. */
  variations: [string, string];
}

/**
 * @description
 * A component to display the generated content variations for a specific platform.
 * It uses a Card layout, SegmentedControl to switch variations, and will include
 * a copy button (Step 19) and character count (Step 18).
 *
 * @component ResultCard
 * @param {ResultCardProps} props - The props for the component.
 */
export function ResultCard({ platformName, variations }: ResultCardProps) {
  // State to track which variation is currently selected (0 or 1)
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<0 | 1>(
    0
  );
  const [isCopied, setIsCopied] = useState<boolean>(false); // <-- State for copy feedback
  const { addToast } = useToast(); // <-- Hook for showing toasts

  // Define buttons for the SegmentedControl
  const variationButtons = [
    { value: "v1", label: "Variation 1" },
    { value: "v2", label: "Variation 2" },
  ];

  // Handle toggle event from SegmentedControl
  const handleToggle = (value: string) => {
    setSelectedVariationIndex(value === "v1" ? 0 : 1);
    setIsCopied(false); // Reset copied state when variation changes
  };

  // --- Copy Handler ---
  const handleCopy = async () => {
    const textToCopy = variations[selectedVariationIndex];
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      addToast({ variant: "success", message: "Copied to clipboard!" });
      // Reset the copied state after a short delay
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      addToast({ variant: "danger", message: "Failed to copy text" });
      setIsCopied(false); // Ensure state is reset on error
    }
  };
  // ---------------------

  // Calculate character count for the selected variation
  const currentLength = variations[selectedVariationIndex].length;
  const isTwitter = platformName === "Twitter";
  const twitterLimit = 280;
  const exceedsLimit = isTwitter && currentLength > twitterLimit;

  return (
    <Card fillWidth background="surface" border="neutral-alpha-weak" radius="l">
      <Column padding="l" gap="m">
        {" "}
        {/* Use Column for vertical layout */}
        <Heading as="h3" variant="heading-default-m">
          {platformName}
        </Heading>
        {/* Segmented Control for switching variations */}
        <SegmentedControl
          buttons={variationButtons}
          onToggle={handleToggle}
          fillWidth
        />
        {/* Display the selected variation text */}
        <Text
          paddingY="m" // Add some padding around the text
          onBackground="neutral-strong" // Use stronger contrast for main content
          style={{ whiteSpace: "pre-wrap" }} // Preserve whitespace and newlines
        >
          {variations[selectedVariationIndex]}
        </Text>
        {/* Row to hold character count and copy button */}
        <Row fillWidth horizontal="space-between" vertical="center" gap="m">
          {/* Character Count Display (conditional for Twitter) */}
          {isTwitter ? (
            <Text
              size="xs"
              onBackground={exceedsLimit ? "danger-medium" : "neutral-weak"} // Conditional background
            >
              {currentLength} / {twitterLimit} characters
            </Text>
          ) : /* Render nothing if not Twitter to maintain layout */
          null}

          {/* Copy Button */}
          <IconButton
            icon={isCopied ? "check" : "clipboard"} // Use simple strings
            onClick={handleCopy}
            variant="tertiary" // Use subtle variant
            tooltip={isCopied ? "Copied!" : "Copy to clipboard"}
            size="m"
          />
        </Row>
      </Column>
    </Card>
  );
}
