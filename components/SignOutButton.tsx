"use client";

import React from "react";
import { Button } from "./ui/button";
import { signOut } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await signOut();

      if (result?.success) {
        toast.success(result.message);
        router.push("/sign-in");
      } else {
        toast.error(result?.message || "Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out");
    }
  };

  return (
    <Button variant="outline" className="btn-secondary" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};

export default SignOutButton;
