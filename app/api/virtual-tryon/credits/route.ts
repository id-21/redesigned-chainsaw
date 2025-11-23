import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserCredits } from '@/lib/features/virtual-tryon/queries';

// GET /api/virtual-tryon/credits - Get user's credit balance
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await getUserCredits(userId);

    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error in GET /api/virtual-tryon/credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
