'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { authService, User } from '../services/auth';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const showNavbar = pathname !== '/login';

  useEffect(() => {
    if (showNavbar) {
      const userData = authService.getUser();
      setUser(userData);
    }
  }, [showNavbar]);

  if (!showNavbar) {
    return <>{children}</>;
  }

  return (
    <>
      {user && <Navbar userName={user.name} userEmail={user.email} />}
      {children}
    </>
  );
}
