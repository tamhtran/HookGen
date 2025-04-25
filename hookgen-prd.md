**Hackathon Project Specification: Social Media Promo Pack Generator**

* **Project Title:** Social Media Promo Pack Generator
* **Version:** 1.0
* **Date:** May 21, 2024
* **Goal:** Create a polished, complete MVP web application within the 1-day hackathon timeframe that helps content creators generate tailored promotional text snippets for multiple social media platforms based on their content details. The project aims to be a strong contender by excelling in Completeness, Polish, Build Quality, and Relevance, with potential for future startup development.

**1. Overview & Problem Statement**

Content creators (streamers, YouTubers, podcasters) spend significant time crafting promotional text for different platforms to maximize reach and engagement for each piece of content. This repetitive task requires adapting the message, tone, and format (length, hashtags, emojis) for platforms like Twitter, YouTube, TikTok, etc.

This tool aims to automate the initial draft generation, providing creators with platform-optimized promotional text snippets instantly, saving them time and ensuring consistency.

**2. Target Audience**

* Video Game Streamers
* YouTube Content Creators
* Podcasters
* Any media creator who promotes their content on multiple social platforms.

**3. Core MVP Functionality**

The application will provide a simple web interface for users to input content details and receive generated promotional text.

* **3.1. Frontend (React)**
  * **Input Form:**
    * `Content Type`: Dropdown selector (e.g., "Stream VOD", "YouTube Video", "Podcast Episode").
    * `Main Topic / Title`: Text input field (required).
    * `Key Highlight / Hook`: Text area field (required). Briefly describe the most engaging part.
    * `Target Vibe / Tone`: Dropdown selector (e.g., "Excited", "Funny", "Informative", "Intriguing", "Urgent") (required, default provided).
    * Submit Button.
  * **Output Display:**
    * Display a clear loading indicator (potentially thematic/animated) while waiting for backend processing.
    * Once results are received, display generated text snippets in clearly separated sections/cards for each target platform:
      * **Twitter:** Display **two** generated tweet variations. Include relevant **emojis** based on vibe and **hashtags**. Show dynamic character count for each variation (<280).
      * **YouTube/Twitch Description:** Display **two** generated short description paragraph variations (~50-100 words).
      * **Short-form Video Hook (TikTok/Shorts/Reels):** Display **two** generated catchy hook/caption variations. Include relevant **emojis** and potential **hashtags**.
    * Each generated snippet variation MUST have a working "Copy to Clipboard" button.
    * Gracefully display error messages if the backend fails.

* **3.2. Backend (Python - Flask/FastAPI)**
  * **API Endpoint:** One endpoint to receive POST requests with form data (content type, topic, highlight, vibe).
  * **LLM Integration:**
    * Use an environment variable for the LLM API Key (e.g., OpenAI).
    * **Prompt Engineering:** Construct specific prompts for the chosen LLM (e.g., GPT-3.5-Turbo, GPT-4o):
      * Craft distinct prompts for *each* target platform (Twitter, YT Description, Short-form Hook).
      * Each prompt must explicitly request **two** distinct variations.
      * Prompts should instruct the LLM to incorporate the `Target Vibe`, use relevant **emojis** appropriately, and generate relevant **hashtags** (especially for Twitter/Shorts).
      * Prompts must specify desired output format and length constraints (e.g., Twitter <280 chars).
    * Execute LLM API calls for each platform's prompt.
  * **Response Handling:** Parse the LLM responses, extracting the two variations for each platform. Handle potential API errors.
  * **Return Value:** Send a JSON response containing the generated text variations structured by platform (e.g., `{"twitter": ["variation1", "variation2"], "youtubeDescription": [...], "shortFormHook": [...]}`).

**4. Key Features & "Wow" Factors (MVP Focus)**

* **Core Value:** Generate tailored social media promotional text from simple inputs.
* **Multiple Variations:** Provides 2 distinct options per platform, enhancing usability (**Wow Factor 1**).
* **Platform Optimization:** Text includes relevant emojis and hashtags tailored to the platform & vibe (**Wow Factor 2**).
* **High Polish Interface:** Clean, intuitive UI, smooth transitions, clear loading state, visual feedback (character counts), reliable copy functionality (**Wow Factor 3 / Judging Criteria**).
* **Completeness:** Fully functional end-to-end flow from input to usable, multi-variation output.

**5. Technology Stack**

* **Frontend:** React (potentially with Create React App, Vite, or Next.js), basic CSS / CSS Framework (e.g., Tailwind CSS for speed if proficient).
* **Backend:** Python (Flask or FastAPI).
* **AI:** Third-party LLM API (e.g., OpenAI API using GPT-3.5-Turbo for speed/cost or GPT-4o if affordable/needed).
* **Deployment (Optional for Hackathon):** If time allows, a simple static deployment (e.g., Vercel, Netlify) for the frontend and a basic PaaS (e.g., Fly.io, Railway, Heroku) for the backend. *Focus on local demo readiness first.*

**6. Judging Criteria Alignment**

* **🚀 Completeness:** Deliver the full input-to-multi-variation-output flow described in Section 3. Working demo is paramount.
* **🖥 Polish:** Achieve the requirements in Section 4 (High Polish Interface). No bugs in the core flow, visually clean, smooth UX, working copy buttons, character counts.
* **🛠 Build Quality:** Reasonably clean, organized code. Functional API endpoint with basic error handling. Environment variables for secrets.
* **🎮 Relevance:** Directly addresses the Media/Gaming theme by providing a tool for Content Creators.

**7. Polish Requirements Checklist (Must-Haves)**

* [ ] Consistent visual design (spacing, typography, colors).
* [ ] Clear Input form with labels and appropriate input types.
* [ ] Visible and informative loading state during generation.
* [ ] Clearly structured output sections per platform.
* [ ] Display of *two* variations per platform.
* [ ] Working "Copy to Clipboard" for *each* variation.
* [ ] Character count display (dynamic) for Twitter variations.
* [ ] Graceful error handling display (e.g., "Generation failed, please try again").
* [ ] Responsive layout (usable on typical laptop screen).
* [ ] No console errors in the browser during normal operation.

**8. Stretch Goals (If Core MVP is 100% complete & polished)**

1. **Brand Voice Hint Input:** Add the optional text area for pasting a writing sample to slightly influence the LLM's tone (low risk addition).
2. **Add Discord Output:** Include generation for a Discord announcement snippet (requires new prompt and UI section).
3. **Refinement Feature (High Risk):** Add a single "Regenerate" button per platform (not per variation) to get two new options if the first set wasn't good.

**9. Out of Scope for Hackathon MVP**

* User accounts or authentication.
* Saving history of generated content.
* Direct integration with social media platforms (posting).
* Image or thumbnail generation/suggestions.
* Analytics or performance tracking.
* Advanced prompt customization by the user.
* Billing or complex API key management for users.

**10. Demo Flow Outline (2-3 minutes)**

1. (5s) Briefly state the problem: Creators waste time writing promo text.
2. (10s) Introduce the solution: Social Media Promo Pack Generator - instant, tailored snippets.
3. (30s) Show the clean input form, quickly fill it out with a relatable example (e.g., a game stream highlight). Select a Vibe.
4. (10s) Hit Submit, point out the loading indicator.
5. (45s) Showcase the results: Show the generated variations for Twitter (mention emojis, hashtags, char count), YouTube Desc, and Short-form Hook. Highlight the two options per platform.
6. (10s) Demonstrate the "Copy to Clipboard" functionality working for one snippet.
7. (10s) Briefly mention the Tech Stack (Python, React, AI API) and the startup potential (more platforms, scheduling, etc.).
8. (Optional - 5s) If a stretch goal was implemented, briefly show it.
