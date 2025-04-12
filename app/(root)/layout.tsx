import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import SignOutButton from "@/components/SignOutButton";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  const user = await getCurrentUser();

  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex justify-between items-center bg-dark-200/50 py-3 px-6 rounded-full shadow-md mb-6">
        <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <Image src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className="text-primary-100">Interview Me</h2>
        </Link>
        
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-primary-200/30">
                <Image 
                  src={user.photoURL} 
                  alt={user.name} 
                  width={32} 
                  height={32} 
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-300 text-primary-100">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="hidden md:inline text-sm text-light-100">{user?.name}</span>
          </div>
          
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
};

export default RootLayout;
