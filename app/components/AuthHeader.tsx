'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import AdminHeaderLink from './AdminHeaderLink';

export default function AuthHeader() {
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
