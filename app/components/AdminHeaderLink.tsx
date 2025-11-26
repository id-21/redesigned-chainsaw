'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminHeaderLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAdmin() {
      try {
        const response = await fetch('/api/auth/is-admin');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
    checkAdmin();
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="mr-4" style={{ visibility: 'hidden' }}>Loading</div>;
  }

  if (!isAdmin) return null;

  return (
    <Link href="/admin/dashboard" className="mr-4">
      Admin Dashboard
    </Link>
  );
}
