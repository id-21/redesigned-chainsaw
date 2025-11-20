# Gemini API Setup - Information Needed

Before we proceed with Gemini integration, please provide:

## Required Information:

1. **Gemini API Credentials**
   - Have you created a Google AI/Gemini API key at https://makersuite.google.com/app/apikey?
   - I'll add these variables to `.env.local`:
     - `GEMINI_API_KEY` - Your API key
     - `GEMINI_MODEL` - Model name (e.g., "gemini-1.5-pro", "gemini-2.0-flash-exp")

2. **Image Generation Documentation**
   - Which Gemini model supports image generation?
   - What's the API endpoint/method for image generation?
   - Please provide any documentation you have for Gemini's image generation capabilities

## Important Note:
I need to confirm the correct SDK and approach for image generation with Gemini. Please share any documentation or examples you have for generating images using Gemini API.

## What I'll Build:
- Text field for image generation prompt
- Generate button
- Display generated image next to the button
- Loading states and error handling
