# HypeGen (YouTube Content Repurposer) Technical Specification

## 1. System Overview

* **Core Purpose:** A web application that takes a YouTube video URL, fetches its title and transcript (using a third-party library), and uses AI to generate tailored promotional content sets (topic, hook, description, tags) for various social media platforms (Twitter, Instagram, TikTok).
* **Value Proposition:** Saves creators time by automatically generating multiple variations of platform-specific promotional content directly from their existing YouTube videos.
* **Key Workflows:**
    1. **Input:** User provides a valid YouTube video URL and selects a desired vibe via a simple web form.
    2. **Processing:** The backend validates the URL, fetches the video title and transcript using the `youtube-transcript` library. It handles errors if the URL is invalid or the transcript cannot be fetched.
    3. **Generation:** The backend uses the video title, the full transcript, and the selected vibe to prompt an LLM (OpenAI) to generate 3 distinct variations of {Topic, Hook, Description, Tags} for each target platform (Twitter, Instagram, TikTok), tailored to platform constraints.
    4. **Output:** The application displays the 3 generated variations for each platform clearly, allowing the user to select a variation and copy its content.
* **System Architecture:**
  * **Framework:** Next.js 14+ with App Router.
  * **Frontend:** React (Client Components for interaction), `once-ui` component library (as currently implemented), Tailwind CSS. *(Note: Original spec mentioned Shadcn UI, but implementation used `once-ui`)*.
  * **Backend:** Node.js via Next.js API Route (`/api/generate`).
  * **Dependencies:** `youtube-transcript` library for fetching transcripts.
  * **AI Service:** OpenAI API (Chat Completions - e.g., GPT-4o or GPT-3.5-turbo).
  * **Deployment:** Vercel (recommended).

## 2. Project Structure

*(Adapted for the new HypeGen functionality)*

```
/hookgen (Root Directory)
├── public/
│   └── ... (static assets)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts     # <-- Backend: URL validation, YT fetch, AI generation
│   │   ├── resources/
│   │   │   └── config.js      # <-- Starter config (review/adapt/remove)
│   │   ├── favicon.ico
│   │   ├── layout.tsx         # Root layout (Server Component)
│   │   └── page.tsx           # Main page (Server Component, renders HypeGenForm)
│   ├── components/
│   │   ├── hypegen/           # <-- Project-specific components
│   │   │   ├── HypeGenForm.tsx  # <-- Main client component (URL + Vibe input)
│   │   │   └── ResultCard.tsx   # <-- Result display (Platform, Variations, Topic/Hook/Desc/Tags)
│   │   └── ui/                # <-- Potentially unused if only using once-ui
│   ├── lib/
│   │   ├── openai.ts          # OpenAI client utility
│   │   ├── prompts.ts         # <-- Updated: Prompt generation using transcript/title/vibe
│   │   └── youtube.ts         # <-- NEW: Utility for YouTube URL parsing & transcript fetching
│   ├── styles/
│   │   └── globals.css        # <-- Potentially minimal if using once-ui styling primarily
│   ├── types/
│   │   └── index.ts           # <-- Updated: Shared TS interfaces for new req/res structure
│   └── once-ui/               # <-- Starter template UI library (Currently used)
│       └── ... (once-ui system files)
├── .env.local             # Environment variables (OPENAI_API_KEY)
├── .env.example
├── .eslintrc.json
├── biome.json
├── components.json        # <-- Shadcn UI config (potentially unused)
├── hookgen-impl-plan.md   # <-- Needs update
├── hookgen-prd.md         # <-- May need update
├── hookgen-tech-spec.md   # This file
├── LICENSE
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts     # <-- Tailwind config (used by once-ui and potentially custom styles)
└── tsconfig.json
```

**Note:** The structure reflects the shift to YouTube processing, including a new `youtube.ts` utility and updated roles for `prompts.ts`, `HypeGenForm.tsx`, `ResultCard.tsx`, and `types/index.ts`.

## 3. Feature Specification

### 3.1 User Input Form

* **Component:** `src/components/hypegen/HypeGenForm.tsx` (Client Component: `'use client'`)
* **User Story:** As a content creator, I want to input a YouTube video URL and select a target vibe so the tool can generate relevant promotional content based on the video's transcript and title.
* **Requirements:**
  * Form Layout: A single-column form using `once-ui` layout components (`Column`).
  * **YouTube URL:**
    * Component: `once-ui` `Input`.
    * Type: `url`.
    * Placeholder: "Enter YouTube video URL (e.g., <https://www.youtube.com/watch?v=>...)".
    * State: `useState<string>`.
    * Validation:
      * Required.
      * Must match valid YouTube URL patterns (e.g., `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/live/`). Use regex for client-side check.
      * Display clear error message within the form if validation fails (e.g., using `once-ui` `Feedback` or input error state).
  * **Target Vibe/Tone:**
    * Component: `once-ui` `Select`.
    * Options: "Excited", "Funny", "Informative", "Intriguing", "Urgent".
    * State: `useState<string>`.
    * Validation: Required. Default value "Excited".
  * **Generate Button:**
    * Component: `once-ui` `Button`.
    * Label: "Generate Content".
    * Action: Triggers form submission handler (`handleSubmit`).
    * Disabled state: While loading (`isLoading`) or if URL input is empty/invalid.
  * **State Management:** Use `React.useState` for `url`, `vibe`, `isLoading`, `apiResponse` (new structure), and `error`.
* **Implementation Steps:**
    1. Modify `HypeGenForm.tsx`.
    2. Remove unused state hooks (`contentType`, `topic`, `highlight`).
    3. Add state hook for `url`.
    4. Remove `Select` (Content Type), `Input` (Topic), `Textarea` (Highlight).
    5. Add `Input` for YouTube URL, bind state, add `onChange`.
    6. Implement client-side URL validation logic within `handleSubmit` or via an `onChange` handler.
    7. Update `handleSubmit` to use `url` and `vibe` in the payload.
* **Error Handling:**
  * Display URL format validation errors directly associated with the input field.
  * Display general submission errors (network, API issues, transcript fetch failures) using `once-ui` `Feedback` below the form.

### 3.2 Output Display

* **Component:** Primarily within `HypeGenForm.tsx`, rendering `ResultCard.tsx` components.
* **User Story:** As a content creator, I want to see the generated content sets (Topic, Hook, Description, Tags) clearly organized by platform (Twitter, Instagram, TikTok), with three variations for each, so I can easily choose and copy the best one.
* **Requirements:**
  * **Loading State:** Display `once-ui` `Spinner` while `isLoading` is true.
  * **Error Display:** Display `once-ui` `Feedback` with `variant="danger"` if `error` state is not null or if `apiResponse.success` is false. Show specific errors like "Invalid YouTube URL", "Could not retrieve transcript", "Content generation failed", etc.
  * **Results Area:** Render only if `apiResponse?.success` is true. Use a `once-ui` `Column` with appropriate gap.
  * **Platform Sections:** Iterate through the keys in `apiResponse.data` (`twitter`, `instagram`, `tiktok`).
  * **Result Card:** For each platform, render `ResultCard`:
    * Component: `src/components/hypegen/ResultCard.tsx` (`'use client'`).
    * Root Element: `once-ui` `Card`.
    * Props:
      * `platformName: string` (e.g., "Twitter").
      * `variations: Array<{ topic: string, hook: string, description: string, tags: string[] }>` (Array of 3 variation objects).
    * Header: Display `platformName` using `once-ui` `Heading`.
    * Variation Switching: Use `once-ui` `SegmentedControl` with buttons "Variation 1", "Variation 2", "Variation 3".
    * Content Display: Show the `topic`, `hook`, `description`, and `tags` (formatted as list/tags) for the `selectedVariationIndex`. Use `once-ui` `Text`, `Heading` (for topic?), and potentially custom styling for tags.
    * **Copy Button:** Include an `once-ui` `IconButton` (`icon="clipboard"`/`check`). **Note:** Copy functionality needs refinement. Should it copy all fields for the selected variation, or prompt the user? Initially, copy the `description` field and provide feedback via `useToast`.
* **Implementation Steps:**
    1. Update conditional rendering in `HypeGenForm.tsx` based on the new `apiResponse` structure.
    2. Modify `ResultCard.tsx`:
        * Update `ResultCardProps` to accept the new `variations` array structure.
        * Update `SegmentedControl` to handle 3 variations (update state logic, button definitions).
        * Implement layout to display `topic`, `hook`, `description`, `tags` for the selected variation. Style appropriately (e.g., display tags distinctly).
        * Update `handleCopy` logic to copy the description (or a formatted summary) and provide feedback.
    3. Update `HypeGenForm.tsx` to map `Object.entries(apiResponse.data)` and render the modified `ResultCard`, passing the new props structure.
* **Error Handling:** Gracefully handle cases where parts of the generated content might be missing in the API response. Ensure copy function handles errors.

### 3.3 Generation API

* **Route:** `src/app/api/generate/route.ts`
* **Method:** `POST`
* **Request Body:** `HypeGenRequest` interface (defined in `src/types/index.ts`):

  ```typescript
  interface HypeGenRequest {
    url: string; // YouTube video URL
    vibe: string; // e.g., "Excited"
  }
  ```

* **Response Body (Success):** `HypeGenSuccessResponse` interface (defined in `src/types/index.ts`):

  ```typescript
  interface HypeGenSuccessResponse {
    success: true;
    data: HypeGenData;
  }
  // HypeGenData contains results for each platform
  type HypeGenData = {
    [platform in 'twitter' | 'instagram' | 'tiktok']: HypeGenVariation[]; // Array of 3 variations
  };
  // Each variation contains the generated content pieces
  type HypeGenVariation = {
    topic: string;
    hook: string;
    description: string;
    tags: string[]; // Array of hashtag strings
  };
  ```

* **Response Body (Error):** `HypeGenErrorResponse` interface (defined in `src/types/index.ts`):

  ```typescript
  interface HypeGenErrorResponse {
    success: false;
    error: string; // Descriptive error message
  }
  ```

* **Implementation Steps:**
    1. Implement the `POST` handler in `route.ts`.
    2. Parse the request body (`url`, `vibe`).
    3. **Validate URL:** Use regex and potentially a utility function (`lib/youtube.ts`) to validate the YouTube URL format. Return 400 error if invalid.
    4. **Fetch YouTube Data:** Use `youtube-transcript` library (within `lib/youtube.ts`) to fetch the video transcript and potentially the title.
        * Handle errors from `youtube-transcript` (e.g., video not found, transcripts disabled/unavailable). Return appropriate error response (e.g., 404 or 500).
    5. Retrieve OpenAI API key from `process.env.OPENAI_API_KEY`.
    6. Initialize OpenAI client (`lib/openai.ts`).
    7. **Generate Prompts:** Create prompts (`lib/prompts.ts`) for each platform (Twitter, Instagram, TikTok). Each prompt should instruct the AI to generate 3 variations of `{ topic, hook, description, tags }` based on the fetched video title, full transcript, and selected vibe. Emphasize platform-specific constraints (length, style) and the required JSON output format (an array of 3 objects). **Note:** Consider potential transcript length issues and need for summarization/chunking if hitting limits, though initially process the full transcript.
    8. **Execute OpenAI Calls:** Use `Promise.all` to make parallel calls to `openai.chat.completions.create` for each platform.
    9. **Parse & Validate Responses:** Parse the JSON response from OpenAI for each platform. Validate that it's an array containing exactly 3 objects, each matching the `HypeGenVariation` structure. Handle parsing errors or structure mismatches.
    10. **Construct Response:** If all steps succeed, construct the `HypeGenSuccessResponse` with the structured data. If any step fails, construct and return the appropriate `HypeGenErrorResponse` with a descriptive error message and status code (400, 404, 500, etc.).
* **Error Handling:** Implement robust error handling for: request parsing, URL validation, `youtube-transcript` errors (network, unavailable transcript), API key access, OpenAI API errors (rate limits, content filters), and response parsing/validation. Provide informative error messages to the frontend.

## 4. Database Schema

* **Not Applicable.**

## 5. Server Actions

### 5.1 Database Actions

* **Not Applicable.**

### 5.2 Other Actions (API Route detailed in 3.3)

* **YouTube Transcript Integration:**
  * **Library:** `youtube-transcript`.
  * **Functionality:** Fetch video transcript and title based on URL.
  * **Utility:** `src/lib/youtube.ts` for encapsulating fetching logic and URL validation.
  * **Error Handling:** Must handle library-specific errors (video not found, transcripts disabled, network issues).
* **OpenAI API Integration:**
  * **Library:** `openai`.
  * **Authentication:** API Key (`process.env.OPENAI_API_KEY`).
  * **Utility:** `src/lib/openai.ts` (client init), `src/lib/prompts.ts` (prompt generation).
  * **Input:** Video title, full transcript, selected vibe.
  * **Output:** Generate 3 variations per platform (Twitter, Instagram, TikTok) including Topic, Hook, Description, Tags, formatted as a specific JSON structure (array of 3 objects per platform).
  * **Models:** `gpt-4o` or `gpt-3.5-turbo`.
  * **Error Handling:** Handle API errors, rate limits, content filters, and parsing errors related to the expected JSON output structure.

## 6. Design System

* **UI Library:** `once-ui` (as currently implemented). *(Original spec mentioned Shadcn UI as a target)*.
* **Styling:** Tailwind CSS (used by `once-ui` and potentially for minor custom overrides).
* **Core Components:** Use components from `@/once-ui/components`.
* **Custom Components:** `src/components/hypegen/HypeGenForm.tsx`, `src/components/hypegen/ResultCard.tsx` (structure significantly updated).
* **Layout:** Primarily `once-ui` layout components (`Column`, `Row`) and props (`gap`, `padding`, etc.).

## 7. Component Architecture

### 7.1 Server Components

* **`src/app/layout.tsx`:** Root layout.
* **`src/app/page.tsx`:** Main page route.

### 7.2 Client Components

* **`src/components/hypegen/HypeGenForm.tsx`:** (`'use client'`) Manages form state (URL, vibe), user interaction, validation, API call lifecycle, and renders form + results area (delegating to `ResultCard`).
* **`src/components/hypegen/ResultCard.tsx`:** (`'use client'`) Displays results for a single platform. Uses `SegmentedControl` to switch between 3 variations. Displays `topic`, `hook`, `description`, `tags` for the selected variation. Handles copy-to-clipboard interaction.

## 8. Authentication and Authorization

* **Not Applicable.**

## 9. Data Flow

* Client-side state in `HypeGenForm` (`url`, `vibe`, `isLoading`, `apiResponse`, `error`).
* Data passes from Form (`url`, `vibe`) -> `fetch` -> API Route -> `youtube-transcript` (Title, Transcript) -> OpenAI (using Title, Transcript, Vibe) -> API Route (structured results) -> `fetch` Response -> Form State (`apiResponse`) -> UI Render (`ResultCard` mapping).

## 10. Payments

* **Not Applicable.**

## 11. Analytics

* **Not Applicable** for Hackathon MVP.

## 12. Testing

* **Not Applicable** for Hackathon build scope. Focus on manual testing of different YouTube URLs and error conditions.
