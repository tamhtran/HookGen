# Implementation Plan: HypeGen (YouTube Content Repurposer using `once-ui`)

## Phase 1: Setup & Backend Core

- [ ] **Step 1: Update Dependencies & Install youtube-transcript**
  - **Task**: Check `package.json`. Ensure core dependencies (`next`, `react`, `openai`, etc.) are present. Add the `youtube-transcript` library.
  - **Files**:
    - `package.json`: Add `"youtube-transcript": "..."` to dependencies.
  - **Step Dependencies**: None.
  - **User Instructions**: Run `npm install` (or `yarn install`) in the project root (`/Users/ttran/hookgen`).

- [ ] **Step 2: Set Up Environment Variables (Verify)**
  - **Task**: Ensure the `.env.local` file exists and contains `OPENAI_API_KEY`, and that `.env.local` is in `.gitignore`.
  - **Files**:
    - `.env.local`: Verify content `OPENAI_API_KEY=your_openai_api_key_here`.
    - `.gitignore`: Verify `.env*.local` is present.
  - **Step Dependencies**: None.
  - **User Instructions**: Ensure your OpenAI API key is correctly set in `.env.local`.

- [ ] **Step 3: Review `once-ui` Configuration & Styles (Verify)**
  - **Task**: Briefly review `once-ui` config/styles to ensure familiarity (already done in the previous flow, but good to keep in mind).
  - **Files**:
    - `src/app/resources/config.js`
    - `src/once-ui/styles/index.scss`
    - `src/once-ui/tokens/index.scss`
  - **Step Dependencies**: None.
  - **User Instructions**: None (assumes familiarity from previous steps).

- [ ] **Step 4: Define New API Types**
  - **Task**: Update `src/types/index.ts` with the new TypeScript interfaces based on the revised spec: `HypeGenRequest` (url, vibe), `HypeGenVariation` (topic, hook, description, tags), `HypeGenData` (map of platforms to `HypeGenVariation[]`), `HypeGenSuccessResponse`, `HypeGenErrorResponse`, and the union `HypeGenResponse`.
  - **Files**:
    - `src/types/index.ts`: Modify existing file with new type definitions.
  - **Step Dependencies**: None.

- [ ] **Step 5: Implement YouTube Utility**
  - **Task**: Create `src/lib/youtube.ts`. Implement functions to:
      1. Validate YouTube URL patterns (standard watch, youtu.be, shorts, live).
      2. Extract video ID from a valid URL.
      3. Fetch transcript and video title using `youtube-transcript`. Include error handling for fetch failures or unavailable transcripts.
  - **Files**:
    - `src/lib/youtube.ts`: Create file. Add URL parsing/validation logic and `youtube-transcript` fetching logic.
  - **Step Dependencies**: Step 1 (dependency installed).

- [ ] **Step 6: Implement OpenAI Client Utility (Verify)**
  - **Task**: Ensure `src/lib/openai.ts` exists and correctly initializes the OpenAI client using the environment variable.
  - **Files**:
    - `src/lib/openai.ts`: Verify implementation.
  - **Step Dependencies**: Step 2.

- [ ] **Step 7: Update Prompt Generation Utilities**
  - **Task**: Modify `src/lib/prompts.ts`. Create functions (e.g., `generatePlatformContentPrompt`) that take the fetched video `title`, `transcript`, and selected `vibe`. These functions should return message arrays for the OpenAI API, instructing it to generate 3 variations of `{ topic, hook, description, tags }` tailored for each platform (Twitter, Instagram, TikTok) and output the result as a specific JSON array structure (`HypeGenVariation[]`).
  - **Files**:
    - `src/lib/prompts.ts`: Modify file. Update imports for new types. Create new prompt generation logic targeting Twitter, Instagram, TikTok, using title/transcript/vibe, requesting 3 variations and the new JSON structure.
  - **Step Dependencies**: Step 4 (new types).

- [ ] **Step 8: Update API Route - Request Handling & YouTube Fetching**
  - **Task**: Modify the `POST` handler in `src/app/api/generate/route.ts`.
      1. Parse request body for `url` and `vibe`.
      2. Use the utility from `lib/youtube.ts` to validate the `url` and extract the video ID. Return 400 if invalid.
      3. Use the utility to fetch the title and transcript. Handle errors (e.g., transcript unavailable) and return appropriate error responses (404/500).
  - **Files**:
    - `src/app/api/generate/route.ts`: Modify `POST` handler. Add imports for `lib/youtube.ts`. Implement URL validation and transcript/title fetching logic with error handling.
  - **Step Dependencies**: Step 4 (new types), Step 5 (youtube util).

- [ ] **Step 9: Update API Route - OpenAI Calls & Response Handling**
  - **Task**: Continue modifying the `POST` handler in `src/app/api/generate/route.ts`.
      1. Get the OpenAI client.
      2. Use the updated prompt functions (`lib/prompts.ts`) with fetched title/transcript/vibe to generate message arrays for Twitter, Instagram, and TikTok.
      3. Execute parallel OpenAI API calls using `Promise.all`.
      4. Parse and validate the responses from OpenAI, ensuring each returns a valid JSON array of 3 `HypeGenVariation` objects. Handle parsing/validation errors (return 500).
      5. Construct the final `HypeGenSuccessResponse` containing the structured data for all platforms, or return `HypeGenErrorResponse` if any step failed.
  - **Files**:
    - `src/app/api/generate/route.ts`: Modify `POST` handler. Integrate new prompt functions, OpenAI calls, and implement robust parsing/validation for the new expected JSON structure (array of 3 variations per platform). Structure the final success/error response.
  - **Step Dependencies**: Step 6 (openai client), Step 7 (new prompts), Step 8 (title/transcript available).

## Phase 2: Frontend Adaptation

- [ ] **Step 10: Clean Up Starter Page and Layout (Verify)**
  - **Task**: Ensure `src/app/page.tsx` is clean and `src/app/layout.tsx` has necessary providers (already done). Add main page `Heading` if not already present.
  - **Files**:
    - `src/app/page.tsx`
    - `src/app/layout.tsx`
  - **Step Dependencies**: None.

- [ ] **Step 11: Update `HypeGenForm` State & Structure**
  - **Task**: Modify `src/components/hypegen/HypeGenForm.tsx`.
      1. Remove state hooks for `contentType`, `topic`, `highlight`.
      2. Add state hook for `url`. Keep `vibe`, `isLoading`, `apiResponse` (update its type expectation), `error`.
      3. Remove the old form input components (`Select` for type, `Input` for topic, `Textarea` for highlight).
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Update state hooks and remove unused JSX elements.
  - **Step Dependencies**: Step 4 (new types).

- [ ] **Step 12: Update Input Form UI**
  - **Task**: Implement the new UI in `src/components/hypegen/HypeGenForm.tsx` using `once-ui`.
      1. Add an `Input` component for the YouTube URL, bound to the `url` state.
      2. Keep the `Select` component for the `vibe` state.
      3. Ensure the `Button` label is "Generate Content".
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Add the URL `Input` component. Verify `Select` and `Button` components are correctly configured.
  - **Step Dependencies**: Step 11.

- [ ] **Step 13: Update Form Submission Logic**
  - **Task**: Update the `handleSubmit` function in `src/components/hypegen/HypeGenForm.tsx`.
      1. Implement robust client-side validation for the YouTube URL format using regex. Display error if invalid.
      2. Ensure the payload sent via `fetch` contains `{ url, vibe }`.
      3. Update state handling (`setApiResponse`, `setError`) to work with the new API response structure and potential errors (e.g., transcript fetch error).
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Modify `handleSubmit` function for URL validation and updated payload/response handling.
  - **Step Dependencies**: Step 9 (API endpoint updated), Step 12 (UI updated).

- [ ] **Step 14: Update Loading and Error States**
  - **Task**: Ensure loading (`Spinner`) and error (`Feedback`) states in `HypeGenForm.tsx` correctly reflect the new process and handle potentially more specific error messages from the backend.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Review and potentially adjust the conditional rendering of `Spinner` and `Feedback` components to display relevant messages.
  - **Step Dependencies**: Step 13.

- [ ] **Step 15: Update `ResultCard` Props and Structure**
  - **Task**: Modify `src/components/hypegen/ResultCard.tsx`.
      1. Update the `ResultCardProps` interface to accept `platformName: string` and `variations: HypeGenVariation[]` (an array of 3 variations).
      2. Update the internal structure (likely within the `Column` inside the `Card`) to prepare for displaying `topic`, `hook`, `description`, and `tags`.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Update props interface and basic internal JSX structure.
  - **Step Dependencies**: Step 4 (new types).

- [ ] **Step 16: Update Variations Display in `ResultCard`**
  - **Task**: Implement the display logic within `ResultCard.tsx`.
      1. Update the `SegmentedControl` to show buttons "Variation 1", "Variation 2", "Variation 3". Update `handleToggle` and state accordingly.
      2. Conditionally display the `topic` (e.g., using `Heading` or bold `Text`), `hook`, `description` (using `Text`), and `tags` (e.g., mapping to small `Text` elements or similar styled components) based on the `selectedVariationIndex`.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Implement `SegmentedControl` for 3 variations. Add JSX and styling to display topic, hook, description, and tags.
  - **Step Dependencies**: Step 15.

- [ ] **Step 17: Update `ResultCard` Integration in `HypeGenForm`**
  - **Task**: Modify the results mapping logic in `src/components/hypegen/HypeGenForm.tsx`.
      1. Ensure the `Object.entries(apiResponse.data).map(...)` iterates over the correct platform keys (`twitter`, `instagram`, `tiktok`).
      2. Pass the correct props (`platformName`, `variations` array) to each rendered `ResultCard`.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Update the mapping function to render `ResultCard` with the new data structure.
  - **Step Dependencies**: Step 14 (results area ready), Step 16 (`ResultCard` ready).

- [ ] **Step 18: Update Copy-to-Clipboard Button in `ResultCard`**
  - **Task**: Refine the copy button logic in `ResultCard.tsx`.
      1. Decide what content to copy (e.g., primarily the description, maybe hook + description).
      2. Update the `handleCopy` function to use `navigator.clipboard.writeText` with the chosen content for the `selectedVariationIndex`.
      3. Ensure feedback (`isCopied` state, `IconButton` icon toggle, `useToast`) works correctly.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Update `handleCopy` function logic.
  - **Step Dependencies**: Step 16 (selected variation logic exists).

- [ ] **Step 19: Final UI Polish & Testing**
  - **Task**: Review the complete UI flow. Check responsiveness, spacing, alignment, and overall user experience. Test with various valid/invalid YouTube URLs and check error handling. Fix any console errors.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`
    - `src/components/hypegen/ResultCard.tsx`
    - `src/app/page.tsx`
  - **Step Dependencies**: All previous UI steps.

## Phase 3: Deployment

- [ ] **Step 20: Prepare & Deploy to Vercel**
  - **Task**: Verify local build (`npm run build`). Ensure `OPENAI_API_KEY` is set correctly in Vercel environment variables. Deploy the updated application.
  - **Files**: Vercel project settings.
  - **Step Dependencies**: All previous steps.
  - **User Instructions**: Run local build. Set environment variables on Vercel. Deploy via Git push or Vercel CLI.
