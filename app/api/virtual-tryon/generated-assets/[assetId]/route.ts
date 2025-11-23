import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getGeneratedAssetById,
  updateGeneratedAsset,
  deleteGeneratedAsset,
} from '@/lib/features/virtual-tryon/queries';

// GET /api/virtual-tryon/generated-assets/[assetId] - Get specific asset
export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const asset = await getGeneratedAssetById(params.assetId, userId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error in GET /api/virtual-tryon/generated-assets/[assetId]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PATCH /api/virtual-tryon/generated-assets/[assetId] - Update asset
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const asset = await updateGeneratedAsset(params.assetId, userId, body);

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error in PATCH /api/virtual-tryon/generated-assets/[assetId]:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual-tryon/generated-assets/[assetId] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteGeneratedAsset(params.assetId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/virtual-tryon/generated-assets/[assetId]:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
