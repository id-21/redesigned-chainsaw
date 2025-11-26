'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import AdminHeaderLink from './AdminHeaderLink';
import { useEffect, useState } from 'react';

export default function AuthHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return <header className="h-12" />;
  }

  return (
    <header>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <AdminHeaderLink />
        <UserButton />
      </SignedIn>
    </header>
  );
}
