import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenAI } from '@google/genai';
import {
  getProductById,
  getUserCredits,
  deductUserCredits,
  updateGeneratedAsset,
  createGeneratedAsset,
} from '@/lib/features/virtual-tryon/queries';
import { getGenerationTypeCredits } from '@/lib/features/virtual-tryon/utils';

// POST /api/virtual-tryon/generate - Generate virtual try-on image
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, generation_type, prompt } = body;

    // Validate required fields
    if (!product_id || !generation_type) {
      return NextResponse.json(
        { error: 'product_id and generation_type are required' },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to user
    const product = await getProductById(product_id, userId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has images
    if (!product.images || product.images.length === 0) {
      return NextResponse.json(
        { error: 'Product has no images' },
        { status: 400 }
      );
    }

    // Calculate credits needed
    const creditsNeeded = getGenerationTypeCredits(generation_type);

    // Check user credits
    const userCredits = await getUserCredits(userId);
    if (userCredits.credits_remaining < creditsNeeded) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Create generated asset record with 'pending' status
    const generatedAsset = await createGeneratedAsset(userId, {
      product_id,
      generation_type,
      prompt: prompt || null,
      generation_params: {
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
      },
    });

    // Update status to 'processing'
    await updateGeneratedAsset(generatedAsset.id, userId, {
      status: 'processing',
      started_at: new Date().toISOString(),
    });

    try {
      // Prepare Gemini API call
      const apiKey = process.env.GEMINI_API_KEY;
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image';

      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const ai = new GoogleGenAI({ apiKey });

      // Get primary image or first image
      const productImage =
        product.images.find((img) => img.is_primary) || product.images[0];

      // Build generation prompt based on type
      let generationPrompt = prompt || '';

      if (!generationPrompt) {
        switch (generation_type) {
          case 'model_shot':
            generationPrompt = `Generate a professional model wearing or using this product in a studio setting with clean background.`;
            break;
          case 'lifestyle':
            generationPrompt = `Generate a lifestyle image showing this product being used in a realistic, everyday setting.`;
            break;
          case 'room_scene':
            generationPrompt = `Generate a beautifully styled room scene featuring this product in an interior design context.`;
            break;
          default:
            generationPrompt = `Generate an image featuring this product.`;
        }
      }

      // Call Gemini API
      const response = await ai.models.generateContent({
        model,
        contents: generationPrompt,
      });

      // Extract image data
      let imageData: string | null = null;

      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              imageData = part.inlineData.data;
              break;
            }
          }
        }
      }

      if (!imageData) {
        throw new Error('No image generated from AI');
      }

      // For now, store base64 in output_assets
      // In production, you'd upload to Supabase Storage
      const outputAssets = [
        {
          url: `data:image/png;base64,${imageData}`,
          filename: `generated-${generatedAsset.id}.png`,
          type: 'image' as const,
          is_selected: true,
        },
      ];

      const duration = Date.now() - startTime;

      // Update asset with completion
      const completedAsset = await updateGeneratedAsset(
        generatedAsset.id,
        userId,
        {
          status: 'completed',
          is_successful: true,
          output_assets: outputAssets,
          completed_at: new Date().toISOString(),
          generation_duration_ms: duration,
          credits_used: creditsNeeded,
        }
      );

      // Deduct credits from user
      await deductUserCredits(userId, creditsNeeded);

      return NextResponse.json({
        asset: completedAsset,
        credits_remaining: userCredits.credits_remaining - creditsNeeded,
      });
    } catch (generationError) {
      // Update asset with failure
      const errorMessage =
        generationError instanceof Error
          ? generationError.message
          : 'Unknown error occurred';

      await updateGeneratedAsset(generatedAsset.id, userId, {
        status: 'failed',
        is_successful: false,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      });

      throw generationError;
    }
  } catch (error) {
    console.error('Error in POST /api/virtual-tryon/generate:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
