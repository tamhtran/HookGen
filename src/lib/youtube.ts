import { YoutubeTranscript } from "youtube-transcript";

/**
 * @description Extracts the Video ID from various YouTube URL formats.
 * Supports: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..., youtube.com/live/...
 * @param {string} url The YouTube URL.
 * @returns {string | null} The extracted Video ID or null if no valid ID is found.
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) {
    return null;
  }
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    // Standard youtube.com/watch?v= format
    if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname === "/watch"
    ) {
      videoId = urlObj.searchParams.get("v");
    }
    // Shortened youtu.be/ format
    else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.substring(1); // Remove leading '/'
    }
    // Shorts youtube.com/shorts/ format
    else if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname.startsWith("/shorts/")
    ) {
      videoId = urlObj.pathname.split("/shorts/")[1];
    }
    // Live youtube.com/live/ format
    else if (
      urlObj.hostname.includes("youtube.com") &&
      urlObj.pathname.startsWith("/live/")
    ) {
      videoId = urlObj.pathname.split("/live/")[1];
      // Live URLs might have extra path segments, remove them
      if (videoId?.includes("?")) {
        videoId = videoId.split("?")[0];
      }
      if (videoId?.includes("/")) {
        videoId = videoId.split("/")[0];
      }
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
    // If URL parsing fails, try basic regex as a fallback for simple cases
    // (More robust regex could be used, but keep it simple for now)
    const regex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w\-]+)/i;
    const match = url.match(regex);
    if (match && match[1]) {
      videoId = match[1];
    }
  }
  // Basic validation: YouTube IDs are typically 11 characters
  // This is a weak check but filters some obvious garbage.
  if (videoId && /^[a-zA-Z0-9_\-]{11}$/.test(videoId)) {
    return videoId;
  }

  return null;
};

/**
 * @description Fetches the transcript and title (if available) for a given YouTube video ID.
 * @param {string} videoId The YouTube video ID.
 * @returns {Promise<{ transcript: string, title: string | undefined }>} Object containing the full transcript text and title.
 * @throws {Error} If the transcript cannot be fetched or is empty.
 */
export const fetchTranscriptAndTitle = async (
  videoId: string
): Promise<{ transcript: string; title: string | undefined }> => {
  if (!videoId) {
    throw new Error("Invalid video ID provided.");
  }
  console.log(`Fetching transcript for video ID: ${videoId}`);
  try {
    // Fetching with youtube-transcript - title isn't directly available here
    // We might need another library or method to reliably get the title if needed.
    // For now, we'll focus on the transcript.
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      throw new Error("Transcript is empty or unavailable for this video.");
    }

    // Combine transcript parts into a single string
    const transcript = transcriptItems.map((item) => item.text).join(" ");
    console.log(
      `Transcript fetched successfully (length: ${transcript.length})`
    );

    // Placeholder for title fetching - requires another method/library
    const title = undefined; // Title fetching not implemented via youtube-transcript
    console.warn("Title fetching not implemented in this utility.");

    return { transcript, title };
  } catch (error: unknown) {
    console.error(`Error fetching transcript for ${videoId}:`, error);
    if (error instanceof Error) {
      // Provide more specific messages if possible
      if (error.message?.includes("disabled transcripts")) {
        throw new Error("Transcripts are disabled for this video.");
      }
      if (error.message?.includes("No transcript found")) {
        throw new Error(
          "No transcript found for this video (may be unavailable or unsupported language)."
        );
      }
      throw new Error(`Failed to fetch transcript: ${error.message}`);
    } else {
      throw new Error(
        "An unknown error occurred while fetching the transcript."
      );
    }
  }
};
