import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProducts, createProduct } from '@/lib/features/virtual-tryon/queries';
import type { CreateProductInput } from '@/lib/features/virtual-tryon/types';

// GET /api/virtual-tryon/products - Get user's products
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await getUserProducts(userId);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error in GET /api/virtual-tryon/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/virtual-tryon/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CreateProductInput;

    // Validate required fields
    if (!body.name || !body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one image are required' },
        { status: 400 }
      );
    }

    const product = await createProduct(userId, body);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/virtual-tryon/products:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
