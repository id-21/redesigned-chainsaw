import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import path from 'path';
import { ProductAnalysisSchema, type ProductAnalysisResult } from '@/lib/features/virtual-tryon/schemas/product-analysis.schema';
import { createApiUsageLog } from '@/lib/features/virtual-tryon/queries';
import { calculateImageTokens } from '@/lib/features/virtual-tryon/cost-utils/cost-calculator';

// Load prompt from markdown file
async function loadPrompt(filename: string): Promise<string> {
  const promptsDir = path.join(process.cwd(), 'lib', 'features', 'virtual-tryon', 'prompts');
  const filePath = path.join(promptsDir, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return content;
}

// Convert image file to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}

// POST /api/virtual-tryon/analyze-product - Analyze product image with AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get image from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Load prompts from markdown files
    const [systemInstructions, analysisPrompt] = await Promise.all([
      loadPrompt('system-instructions.md'),
      loadPrompt('analyze-product.md'),
    ]);

    // Convert image to base64
    const imageBase64 = await fileToBase64(file);

    // Call Gemini API with vision model and structured output
    const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash-lite'; // Using vision-capable model

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstructions}\n\n${analysisPrompt}`,
            },
            {
              inlineData: {
                mimeType: file.type,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: ProductAnalysisSchema,
      },
    });

    // Extract JSON response from structured output
    // With responseMimeType: "application/json" and responseSchema,
    // Gemini guarantees valid JSON output matching our schema
    let analysisText = '';

    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            analysisText += part.text;
          }
        }
      }
    }

    if (!analysisText) {
      throw new Error('No response from AI');
    }

    // Parse JSON response - guaranteed to be valid JSON by Gemini's structured output
    const productData: ProductAnalysisResult = JSON.parse(analysisText);

    // Log API usage immediately (fire-and-forget for non-blocking performance)
    const usage = response.usageMetadata;
    if (usage) {
      // Calculate image tokens based on uploaded image dimensions
      // For now, using conservative estimate - in production, get actual dimensions
      const imageTokens = calculateImageTokens(1024, 1024);

      createApiUsageLog({
        user_id: userId,
        api_endpoint: '/api/virtual-tryon/analyze-product',
        model_used: model,
        raw_response_metadata: usage,
        prompt_tokens: usage.promptTokenCount || 0,
        prompt_image_tokens: imageTokens,
        output_tokens: usage.candidatesTokenCount || 0,
        thinking_tokens: (usage as any).thoughtsTokenCount || 0,
        total_tokens: usage.totalTokenCount || 0,
      }).catch((err) => {
        console.error('Failed to log API usage:', err);
        // Don't throw - we don't want to fail the request if logging fails
      });
    }

    return NextResponse.json({
      success: true,
      analysis: productData,
    });
  } catch (error) {
    console.error('Error in POST /api/virtual-tryon/analyze-product:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze product',
      },
      { status: 500 }
    );
  }
}
