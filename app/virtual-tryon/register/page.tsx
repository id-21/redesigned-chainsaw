import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserCredits } from '@/lib/features/virtual-tryon/queries';
import ProductRegistration from '../_components/ProductRegistration';

export default async function RegisterProductPage() {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch user's credits
  const credits = await getUserCredits(userId);

  return <ProductRegistration credits={credits} />;
}
