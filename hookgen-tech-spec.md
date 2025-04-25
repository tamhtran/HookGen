
# HypeGen (Social Media Promo Pack Generator) Technical Specification

## 1. System Overview

* **Core Purpose:** An MVP web application built for a 1-day hackathon ("Vibe Coding Hackathon: Media & Gaming MVP Edition") designed to help content creators (streamers, YouTubers, podcasters) quickly generate tailored promotional text snippets for various social media platforms using AI.
* **Value Proposition:** Saves creators time and effort by automating the initial drafting of marketing copy, providing platform-optimized text with appropriate tone, emojis, and hashtags.
* **Key Workflows:**
    1. **Input:** User provides content details (Type, Topic, Highlight, Vibe) via a simple web form.
    2. **Generation:** User submits form, triggering a backend API call that uses an LLM (OpenAI) to generate promotional text variations for Twitter, YouTube/Twitch, and Short-form video platforms.
    3. **Output:** The application displays the generated variations clearly, allowing easy copying for use.
* **System Architecture:**
  * **Framework:** Next.js 14+ with App Router.
  * **Frontend:** React (Server Components where possible, Client Components for interaction), Shadcn UI, Radix UI Primitives, Tailwind CSS. **Note:** The starter template includes a `once-ui` library; this spec prioritizes using Shadcn UI as per project rules, potentially replacing `once-ui` components.
  * **Backend:** Node.js via Next.js API Route (`/api/generate`).
  * **AI Service:** OpenAI API (Chat Completions - e.g., GPT-3.5-Turbo or GPT-4o).
  * **Deployment:** Vercel (recommended).

## 2. Project Structure

*(Based on provided `<file_map>`, adapted for the HypeGen MVP)*

```
/hookgen (Root Directory)
├── public/
│   ├── images/
│   │   ├── og/
│   │   │   └── home.jpg
│   │   ├── 1.jpg
│   │   ├── 2.jpg
│   │   ├── demo.png
│   │   ├── l.jpg
│   │   ├── login.png
│   │   ├── profile.jpg
│   │   └── z.jpg
│   └── trademark/
│       ├── design-engineers-wordmark.svg
│       ├── dopler-wordmark.svg
│       ├── enroll-wordmark.svg
│       ├── icon-dark.svg
│       ├── icon-light.svg
│       ├── magic-portfolio-wordmark.svg
│       ├── type-dark.svg
│       └── type-light.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts     # <-- Backend generation logic
│   │   ├── resources/
│   │   │   └── config.js      # <-- Starter config (review/adapt/remove)
│   │   ├── favicon.ico
│   │   ├── layout.tsx         # Root layout (Server Component)
│   │   └── page.tsx           # Main page (Server Component, renders HypeGenForm)
│   ├── components/            # <-- NEW: For Shadcn UI and custom components
│   │   ├── ui/                # <-- Shadcn UI components (populated by CLI)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── progress.tsx
│   │   │   └── alert.tsx
│   │   └── hypegen/           # <-- Project-specific components
│   │       ├── HypeGenForm.tsx  # <-- Main client component
│   │       └── ResultCard.tsx   # <-- Result display component
│   ├── lib/                   # <-- NEW: For utilities
│   │   ├── openai.ts          # <-- OpenAI client utility
│   │   ├── prompts.ts         # <-- Prompt generation utility
│   │   └── utils.ts           # <-- Shadcn utils / General utils
│   ├── styles/                # <-- NEW: For global styles
│   │   └── globals.css        # <-- Tailwind base/ Shadcn variables
│   ├── types/                 # <-- NEW: Shared TypeScript interfaces
│   │   └── index.ts
│   └── once-ui/               # <-- Starter template UI library (To be reviewed/replaced by Shadcn)
│       ├── components/
│       │   └── ... (existing once-ui components)
│       ├── hooks/
│       │   └── ... (existing once-ui hooks)
│       ├── modules/
│       │   └── ... (existing once-ui modules)
│       ├── styles/
│       │   └── ... (existing once-ui styles)
│       ├── tokens/
│       │   └── ... (existing once-ui tokens)
│       ├── icons.ts
│       ├── interfaces.ts
│       └── types.ts
├── .env.local             # <-- NEW: Environment variables (OPENAI_API_KEY)
├── .env.example
├── .eslintrc.json
├── biome.json
├── components.json        # <-- NEW: Shadcn UI config
├── hookgen-impl-plan.md
├── hookgen-prd.md
├── hookgen-tech-spec.md
├── LICENSE
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts     # <-- NEW/Modified: Tailwind config
└── tsconfig.json
```

**Note:** New directories/files specific to the HypeGen MVP and Shadcn UI integration are marked with `<-- NEW` or described. The existing `once-ui` directory from the starter template is present but its components will likely be replaced by Shadcn components during implementation as per project rules.

## 3. Feature Specification

### 3.1 User Input Form

* **Component:** `src/components/hypegen/HypeGenForm.tsx` (Client Component: `'use client'`)
* **User Story:** As a content creator, I want to input details about my content (type, topic, key highlight, desired vibe) so the tool can generate relevant promo text.
* **Requirements:**
  * Form Layout: A single-column form using Tailwind CSS for layout.
  * **Content Type:**
    * Component: Shadcn `Select` (`components/ui/select.tsx`).
    * Options: "Stream VOD", "YouTube Video", "Podcast Episode".
    * State: `useState<string>`.
    * Validation: Required. Default placeholder like "Select Content Type...".
  * **Main Topic/Title:**
    * Component: Shadcn `Input` (`components/ui/input.tsx`).
    * Type: `text`.
    * Placeholder: "e.g., My First Look at Palworld".
    * State: `useState<string>`.
    * Validation: Required, min length (e.g., 3 chars).
  * **Key Highlight/Hook:**
    * Component: Shadcn `Textarea` (`components/ui/textarea.tsx`).
    * Placeholder: "e.g., Caught a legendary Pal!"
    * State: `useState<string>`.
    * Validation: Required, min length (e.g., 10 chars).
    * Resizable: Vertically.
  * **Target Vibe/Tone:**
    * Component: Shadcn `Select`.
    * Options: "Excited", "Funny", "Informative", "Intriguing", "Urgent".
    * State: `useState<string>`.
    * Validation: Required. Default value "Excited".
  * **Generate Button:**
    * Component: Shadcn `Button` (`components/ui/button.tsx`).
    * Label: "Generate Snippets".
    * Action: Triggers form submission handler.
    * Disabled state: While loading or if form is invalid.
  * **State Management:** Use `React.useState` for form fields, loading status (`isLoading: boolean`), results (`apiResponse: HypeGenResponse | null`), and errors (`error: string | null`).
* **Implementation Steps:**
    1. Scaffold `HypeGenForm.tsx` component, mark with `'use client'`.
    2. Install required Shadcn UI components via CLI (`npx shadcn-ui@latest add ...`).
    3. Import and use Shadcn components within the form JSX.
    4. Implement `useState` hooks for form fields, loading, results, error.
    5. Add `onChange` / `onValueChange` handlers to update state.
    6. Implement `handleSubmit` async function: client-side validation, set loading state, call `fetch('/api/generate', { method: 'POST', ... })`, handle response, update state.
* **Error Handling:**
  * Display validation errors (e.g., using simple text or integrating with Shadcn `Label`'s error state if applicable).
  * Display generic API error message using Shadcn `Alert` (`components/ui/alert.tsx`).

### 3.2 Output Display

* **Component:** Primarily within `HypeGenForm.tsx`, rendering `ResultCard.tsx` (Client Component: `'use client'`)
* **User Story:** As a content creator, I want to see the generated promotional text clearly organized by platform, with two variations for each, so I can easily choose and copy the best one.
* **Requirements:**
  * **Loading State:** Display Shadcn `Progress` (`components/ui/progress.tsx`) or a simple spinner while `isLoading` is true.
  * **Error Display:** Display Shadcn `Alert` with `variant="destructive"` if `error` state is not null.
  * **Results Area:** Render only if `apiResponse` is not null and `isLoading`/`error` are false.
  * **Platform Sections:** Iterate through the keys in `apiResponse.data` (e.g., `twitter`, `youtubeDescription`, `shortFormHook`).
  * **Result Card:** For each platform, render `ResultCard`:
    * Uses Shadcn `Card` (`components/ui/card.tsx`) as root. `CardHeader` shows platform name.
    * `CardContent` contains Shadcn `Tabs` (`components/ui/tabs.tsx`).
    * `TabsList` has `TabsTrigger` for "Variation 1" and "Variation 2".
    * Each `TabsContent` displays the corresponding text variation. Include emojis/hashtags.
    * **Character Count (Twitter only):** Below each Twitter variation text, display `current_length / 280`. Use Tailwind `text-destructive` class conditionally.
    * **Copy Button:** Place a small Shadcn `Button` (icon-only, e.g., using `lucide-react` icons like `ClipboardCopy` and `Check`) inside each `TabsContent`.
    * Copy Action: On click, use `navigator.clipboard.writeText(text)`. Provide visual feedback.
* **Implementation Steps:**
    1. Add conditional rendering in `HypeGenForm.tsx` for loading, error, results.
    2. Create `ResultCard.tsx` component (`components/hypegen/ResultCard.tsx`), mark `'use client'`.
    3. Implement Shadcn `Card`, `Tabs` structure within `ResultCard`.
    4. Pass `platformName` and `variations` as props.
    5. Implement character count logic for Twitter.
    6. Implement "Copy" button functionality with feedback.
* **Error Handling:** Handle potential `navigator.clipboard` errors. Render gracefully if variation data is malformed.

### 3.3 Generation API

* **Route:** `src/app/api/generate/route.ts`
* **Method:** `POST`
* **Request Body:** `HypeGenRequest` interface (defined in `src/types/index.ts`).
* **Response Body (Success):** `HypeGenResponse` interface (defined in `src/types/index.ts`).
* **Response Body (Error):** `HypeGenErrorResponse` interface (defined in `src/types/index.ts`).
* **Implementation Steps:**
    1. Implement the `POST` handler in `route.ts`.
    2. Parse and validate the request body using the `HypeGenRequest` type.
    3. Retrieve OpenAI API key from `process.env.OPENAI_API_KEY`.
    4. Initialize OpenAI client using `lib/openai.ts`.
    5. Generate platform-specific prompts using `lib/prompts.ts`.
    6. Execute parallel OpenAI API calls using `Promise.all`.
    7. Parse and validate JSON responses from OpenAI.
    8. Construct and return the appropriate `NextResponse.json()` based on success or failure.
* **Error Handling:** Implement robust error handling for request parsing, API key access, OpenAI API calls, and response parsing/validation.

## 4. Database Schema

* **Not Applicable** for Hackathon MVP.

## 5. Server Actions

### 5.1 Database Actions

* **Not Applicable.**

### 5.2 Other Actions (API Route detailed in 3.3)

* **OpenAI API Integration:**
  * **Library:** `openai` Node.js package.
  * **Authentication:** API Key via `process.env.OPENAI_API_KEY`.
  * **Utility:** `src/lib/openai.ts` for client initialization.
  * **Prompts:** `src/lib/prompts.ts` for generating structured prompts.
  * **Models:** `gpt-4o` or `gpt-3.5-turbo`.
  * **Error Handling:** Must handle API errors, rate limits, content filters, and parsing errors.

## 6. Design System

* **UI Library:** Shadcn UI.
* **Styling:** Tailwind CSS.
* **Core Components:** Use installed Shadcn components from `src/components/ui/`.
* **Custom Components:** `src/components/hypegen/HypeGenForm.tsx`, `src/components/hypegen/ResultCard.tsx`.
* **Layout:** Tailwind CSS utility classes (`flex`, `grid`, `p-*`, `m-*`, `gap-*`, responsive prefixes `sm:`, `md:`).

## 7. Component Architecture

### 7.1 Server Components

* **`src/app/layout.tsx`:** Root layout, sets up global styles, fonts, providers.
* **`src/app/page.tsx`:** Main page route, renders the primary client component (`HypeGenForm`).

### 7.2 Client Components

* **`src/components/hypegen/HypeGenForm.tsx`:** (`'use client'`) Manages form state, user interaction, API call lifecycle (loading, error, success), and renders form + results area (delegating to `ResultCard`).
* **`src/components/hypegen/ResultCard.tsx`:** (`'use client'`) Displays results for a single platform using Tabs, handles character count display, and copy-to-clipboard interaction.

## 8. Authentication and Authorization

* **Not Applicable.**

## 9. Data Flow

* Client-side state in `HypeGenForm` using `useState`.
* Data passes from Form -> `fetch` -> API Route -> OpenAI -> API Route -> `fetch` Response -> Form State -> UI Render.

## 10. Payments

* **Not Applicable.**

## 11. Analytics

* **Not Applicable** for Hackathon MVP.

## 12. Testing

* **Not Applicable** for Hackathon build scope. Focus on manual testing.
