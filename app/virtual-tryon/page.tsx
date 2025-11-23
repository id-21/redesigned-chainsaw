import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/supabase-admin';
import { getUserGeneratedAssets, getUserCredits, getUserProducts } from '@/lib/features/virtual-tryon/queries';
import VirtualTryonHomePage from './_components/VirtualTryonHomePage';

export default async function VirtualTryonPage() {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user data
  const user = await getUserById(userId);

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch products, recent generations, and credits
  const [products, recentGenerations, credits] = await Promise.all([
    getUserProducts(userId),
    getUserGeneratedAssets(userId, 12),
    getUserCredits(userId),
  ]);

  return (
    <VirtualTryonHomePage
      user={{
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
      }}
      credits={credits}
      products={products}
      recentGenerations={recentGenerations}
    />
  );
}
