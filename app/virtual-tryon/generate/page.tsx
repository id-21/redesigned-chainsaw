import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProducts, getUserCredits } from '@/lib/features/virtual-tryon/queries';
import GenerationPageClient from '../_components/GenerationPageClient';

export default async function GeneratePage() {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's products and credits
  const [products, credits] = await Promise.all([
    getUserProducts(userId),
    getUserCredits(userId),
  ]);

  return <GenerationPageClient products={products} credits={credits} />;
}
