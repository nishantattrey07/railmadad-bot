import { signOut } from 'next-auth/react';

export default function handleLogout() {
  signOut({ callbackUrl: '/login' });
}
