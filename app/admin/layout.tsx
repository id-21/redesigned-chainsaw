import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/supabase-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>

          <nav className="mt-6">
            <Link
              href="/admin/dashboard"
              className="block px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/products"
              className="block px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/admin/generations"
              className="block px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Generations
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6">
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="ml-64">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Admin Dashboard
              </h2>
              <div className="flex items-center gap-4">
                <UserButton />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">{children}</main>
        </div>
      </div>
  );
}
