import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getUserGeneratedAssets,
  createGeneratedAsset,
} from '@/lib/features/virtual-tryon/queries';
import type { CreateGenerationInput } from '@/lib/features/virtual-tryon/types';

// GET /api/virtual-tryon/generated-assets - Get user's generated assets
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const assets = await getUserGeneratedAssets(userId, limit, offset);

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Error in GET /api/virtual-tryon/generated-assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated assets' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-tryon/generated-assets - Create new generation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CreateGenerationInput;

    // Validate required fields
    if (!body.product_id || !body.generation_type) {
      return NextResponse.json(
        { error: 'product_id and generation_type are required' },
        { status: 400 }
      );
    }

    const asset = await createGeneratedAsset(userId, body);

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/virtual-tryon/generated-assets:', error);
    return NextResponse.json(
      { error: 'Failed to create generated asset' },
      { status: 500 }
    );
  }
}
