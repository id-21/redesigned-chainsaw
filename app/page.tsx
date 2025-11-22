import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/supabase-admin";
import HomePageClient from "./components/HomePageClient";

export default async function Home() {
  const { userId } = await auth();
  let isAdmin = false;

  if (userId) {
    const user = await getUserById(userId);
    isAdmin = user?.role === "admin" && user?.is_active === true;
  }

  return (
    <>
      {isAdmin && <h1 className="text-4xl font-bold p-8">Admin</h1>}
      <HomePageClient />
    </>
  );
}
