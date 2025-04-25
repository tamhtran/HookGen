# Implementation Plan (Using `once-ui` Components)

## Setup & Configuration

- [ ] Step 1: Verify Dependencies & Install OpenAI/Classnames
  - **Task**: Check `package.json` for core Next.js/React/TS/Tailwind dependencies. Add `openai` and `classnames` if not already present.
  - **Files**:
    - `package.json`: Ensure `"openai": "..."` and `"classnames": "..."` are in dependencies.
  - **Step Dependencies**: None.
  - **User Instructions**: Run `npm install` (or `yarn install`) in the project root (`/Users/ttran/hookgen`).

- [ ] Step 2: Set Up Environment Variables
  - **Task**: Create the `.env.local` file for the OpenAI API key and ensure it's gitignored.
  - **Files**:
    - `.env.local`: Create file with content `OPENAI_API_KEY=your_openai_api_key_here`.
    - `.gitignore`: Verify `.env.local` is present.
  - **Step Dependencies**: None.
  - **User Instructions**: Replace `your_openai_api_key_here` in `.env.local` with your actual OpenAI API key. Restart the Next.js development server.

- [ ] Step 3: Review `once-ui` Configuration & Styles
  - **Task**: Briefly review `src/app/resources/config.js`, `src/once-ui/styles/index.scss`, and `src/once-ui/tokens/index.scss` to understand the existing theme, styling variables, and global styles provided by the starter template.
  - **Files**:
    - `src/app/resources/config.js`
    - `src/once-ui/styles/index.scss`
    - `src/once-ui/tokens/index.scss`
  - **Step Dependencies**: None.
  - **User Instructions**: Familiarize yourself with the available styling options and tokens in the `once-ui` system.

## Backend Development (API Route & Libs)

- [ ] Step 4: Define API Types
  - **Task**: Create the `types` directory (if it doesn't exist) and define shared TypeScript interfaces for the API request body and success/error responses.
  - **Files**:
    - `src/types/index.ts`: Create file. Define `HypeGenRequest`, `HypeGenData`, `HypeGenResponse`, `HypeGenErrorResponse` interfaces as specified in the technical specification.
  - **Step Dependencies**: None.

- [ ] Step 5: Create API Route Structure & Basic Validation
  - **Task**: Set up the file structure for the API route `/api/generate` and implement the basic `POST` handler with request body parsing and validation for required fields (`topic`, `highlight`).
  - **Files**:
    - `src/app/api/generate/route.ts`: Create file. Import `NextRequest`, `NextResponse`. Export `async function POST(request: NextRequest)`. Parse JSON body (`await request.json()`). Check required fields. Return 400 error if invalid. Include try/catch.
  - **Step Dependencies**: Step 4.

- [ ] Step 6: Implement OpenAI Client Utility
  - **Task**: Create the `lib` directory (if it doesn't exist) and the `openai.ts` utility to initialize the OpenAI client using the environment variable.
  - **Files**:
    - `src/lib/openai.ts`: Create file. Import `OpenAI` from `openai`. Define and export a function `getOpenAIClient()` that checks for `process.env.OPENAI_API_KEY` (throws error if missing) and returns `new OpenAI(...)`.
  - **Step Dependencies**: Step 1, Step 2.

- [ ] Step 7: Implement Prompt Generation Utilities
  - **Task**: Create `lib/prompts.ts` with functions to generate platform-specific LLM message arrays based on request data, including instructions for variations, tone, emojis, hashtags, length, and JSON output format.
  - **Files**:
    - `src/lib/prompts.ts`: Create file. Import `HypeGenRequest` from `types`. Define `generateTwitterPromptMessages`, `generateYoutubePromptMessages`, `generateShortsPromptMessages` functions returning message arrays as specified in the tech spec.
  - **Step Dependencies**: Step 4.

- [ ] Step 8: Implement Core API Generation & OpenAI Call Logic
  - **Task**: Integrate the OpenAI client and prompt functions into the API route. Make parallel calls to OpenAI for each platform. Handle potential API errors. *Return raw content initially.*
  - **Files**:
    - `src/app/api/generate/route.ts`: Import utilities from `lib/`. In `POST`, get client, generate prompts, use `Promise.all` to call `openai.chat.completions.create` (model `gpt-4o` or `gpt-3.5-turbo`, temp 0.7). Wrap in `try...catch`. Log raw `choices[0].message.content`. Return temporary success JSON. Handle errors with 500 status.
  - **Step Dependencies**: Step 5, Step 6, Step 7.

- [ ] Step 9: Implement API Response Parsing and Validation
  - **Task**: Refine the API route to safely parse the expected JSON array `[string, string]` from LLM responses. Validate the structure. Construct the final `HypeGenResponse` or return an error.
  - **Files**:
    - `src/app/api/generate/route.ts`: Modify the `try` block after `Promise.all`. Use `JSON.parse()` on LLM content within nested try/catch. Validate parsed data is `[string, string]`. If valid, construct `HypeGenData`. Return `NextResponse.json({ success: true, data: ... })`. If parsing/validation fails, return 500 error with specific message.
  - **Step Dependencies**: Step 8.

## Frontend Development (Using `once-ui`)

- [ ] Step 10: Clean Up Starter Page and Layout
  - **Task**: Remove the example content from `src/app/page.tsx`. Ensure `src/app/layout.tsx` sets up the basic structure, fonts, and necessary providers (`ThemeProvider`, `ToastProvider`) from `once-ui`.
  - **Files**:
    - `src/app/page.tsx`: Remove demo components. Add a main container using `once-ui` `Column` or `Flex` with appropriate padding (e.g., `<Column fillWidth paddingY="80" paddingX="l" horizontal="center">`).
    - `src/app/layout.tsx`: Verify structure, remove unnecessary demo imports/components. Ensure `ThemeProvider` and `ToastProvider` wrap `{children}`.
  - **Step Dependencies**: Step 3.

- [ ] Step 11: Create `hypegen` Components Directory & Scaffold `HypeGenForm`
  - **Task**: Create the `src/components/hypegen` directory. Create `HypeGenForm.tsx`, mark `'use client'`, set up basic structure and state hooks (`contentType`, `topic`, `highlight`, `vibe`, `isLoading`, `apiResponse`, `error`).
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Create file. Add `'use client'`. Import `useState`. Import necessary types. Define component. Add state hooks. Return placeholder JSX (e.g., `<Column>Form Placeholder</Column>`).
  - **Step Dependencies**: Step 4.

- [ ] Step 12: Build Input Form UI using `once-ui` Components
  - **Task**: Implement the form UI within `HypeGenForm.tsx` using `once-ui` components (`Select`, `Input`, `Textarea`, `Button`). Connect them to state variables.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Import components from `@/once-ui/components`. Add JSX for the form layout using `Column` and `Row` or `Flex`. Implement `Select` for Content Type & Vibe (provide options array). Implement `Input` for Topic. Implement `Textarea` for Highlight. Add the Generate `Button`. Use `label` and `id` props appropriately.
  - **Step Dependencies**: Step 11.

- [ ] Step 13: Implement Form Submission Logic in `HypeGenForm`
  - **Task**: Implement the `handleSubmit` function to validate inputs, set loading state, call the `/api/generate` endpoint using `fetch`, and update state based on the response.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Implement `handleSubmit` async function. Add basic required field checks. Set `isLoading`, clear `error`/`apiResponse`. Construct payload. Use `fetch` POST. Handle `res.ok`, parse JSON, update state. Set `isLoading` false in `finally`. Attach `handleSubmit` to the Button's `onClick`. Disable button if `isLoading`.
  - **Step Dependencies**: Step 9, Step 12.

- [ ] Step 14: Display Loading and Error States using `once-ui`
  - **Task**: Conditionally render a loading indicator (`once-ui` `Spinner`) and an error message (`once-ui` `Feedback`) based on the `isLoading` and `error` states.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Import `Spinner`, `Feedback` from `@/once-ui/components`. Add conditional JSX: `{isLoading && <Spinner size="l" />}` and `{error && <Feedback variant="danger" title="Error">{error}</Feedback>}`.
  - **Step Dependencies**: Step 13.

- [ ] Step 15: Scaffold `ResultCard` Component
  - **Task**: Create `src/components/hypegen/ResultCard.tsx`, mark `'use client'`, define props, and set up basic `once-ui` `Card` structure.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Create file. Add `'use client'`. Import `Card`, `Heading`, `Flex` from `@/once-ui/components`. Define `ResultCardProps` interface. Render a basic Card with `Heading` for `platformName`.
  - **Step Dependencies**: Step 4.

- [ ] Step 16: Implement Variations Display with `SegmentedControl` in `ResultCard`
  - **Task**: Use `once-ui` `SegmentedControl` (or simple state/buttons if `SegmentedControl` isn't suitable for tab-like content display) to switch between the two text variations. Display the selected variation text.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Import `SegmentedControl`, `Text` from `@/once-ui/components`. Add `useState` for `selectedVariationIndex`. Implement `SegmentedControl` with buttons "Variation 1", "Variation 2". Conditionally display `variations[selectedVariationIndex]` using a `Text` component below the control.
  - **Step Dependencies**: Step 15.

- [ ] Step 17: Integrate `ResultCard` into `HypeGenForm` Results Display
  - **Task**: Conditionally render the results section in `HypeGenForm`. Map `apiResponse.data` to render `ResultCard` components.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`: Add conditional block for `apiResponse.success`. Map `Object.entries(apiResponse.data)` to render `<ResultCard ... />`, passing formatted `platformName` and `variations`. Use `Flex` or `Column` with appropriate gap/padding for layout.
  - **Step Dependencies**: Step 14, Step 16.

- [ ] Step 18: Add Twitter Character Count in `ResultCard`
  - **Task**: Implement dynamic character count display for Twitter variations.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Import `Text` from `@/once-ui/components`. Inside the Twitter card logic (check `platformName`), add a `Text` component below the variation display. Calculate `variations[selectedVariationIndex].length`. Display count. Use `onBackground` prop (e.g., `danger-weak`) conditionally if > 280.
  - **Step Dependencies**: Step 16.

- [ ] Step 19: Implement Copy-to-Clipboard Button in `ResultCard`
  - **Task**: Add a copy button (`once-ui` `IconButton`) for the currently selected variation and implement clipboard logic with feedback.
  - **Files**:
    - `src/components/hypegen/ResultCard.tsx`: Import `IconButton`, `useState` from `@/once-ui/components` and `react`. Add `useState` for `isCopied`. Add an `IconButton` (e.g., `icon="clipboard"`). Implement `handleCopy` using `navigator.clipboard.writeText(variations[selectedVariationIndex])`. Set `isCopied` true, then false after timeout. Conditionally change icon name (`check` vs `clipboard`).
  - **Step Dependencies**: Step 16.

- [ ] Step 20: Render `HypeGenForm` on Main Page
  - **Task**: Import and render the `HypeGenForm` component within `src/app/page.tsx`.
  - **Files**:
    - `src/app/page.tsx`: Import `HypeGenForm` from `@/components/hypegen/HypeGenForm`. Render `<HypeGenForm />` inside the main container.
  - **Step Dependencies**: Step 12.

- [ ] Step 21: Final UI Polish & Styling (using `once-ui` conventions)
  - **Task**: Review UI against Polish Checklist. Adjust `once-ui` component props (padding, margin, gap, background, border, etc.) and potentially add minimal custom CSS/SCSS module overrides if needed for alignment/spacing. Ensure responsiveness and no console errors. Add page title using `once-ui` `Heading`.
  - **Files**:
    - `src/components/hypegen/HypeGenForm.tsx`
    - `src/components/hypegen/ResultCard.tsx`
    - `src/app/page.tsx`: Add `<Heading as="h1" variant="display-default-l" align="center" marginBottom="l">HypeGen</Heading>`. Adjust main container props.
    - *(Optional)* Create `src/components/hypegen/HypeGen.module.scss` for minor style overrides if needed.
  - **Step Dependencies**: All previous UI steps.

## Deployment (Optional)

- [ ] Step 22: Prepare & Deploy to Vercel
  - **Task**: Verify local build (`npm run build`). Set environment variables on Vercel. Deploy.
  - **Files**: Vercel project settings.
  - **Step Dependencies**: All previous steps.
  - **User Instructions**: Set `OPENAI_API_KEY` in Vercel Environment Variables. Deploy via Git push or Vercel CLI.
