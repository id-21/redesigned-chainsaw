import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/supabase-admin";
import HomePageClient from "./components/HomePageClient";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  let isAdmin = false;

  if (userId) {
    const user = await getUserById(userId);
    isAdmin = user?.role === "admin" && user?.is_active === true;
  }

  return (
    <>
      {isAdmin && (
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4">Admin</h1>
          <Link
            href="/admin/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      )}
      <HomePageClient />
    </>
  );
}
