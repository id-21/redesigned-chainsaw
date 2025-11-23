import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProductById, getUserCredits } from '@/lib/features/virtual-tryon/queries';
import GenerationWithProduct from '../../_components/GenerationWithProduct';

export default async function GenerateWithProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch product and credits
  const [product, credits] = await Promise.all([
    getProductById(productId, userId),
    getUserCredits(userId),
  ]);

  // Redirect if product not found
  if (!product) {
    redirect('/virtual-tryon');
  }

  return <GenerationWithProduct product={product} credits={credits} />;
}
