"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [mounted, isConnected, router]);

  // Prevent rendering children during redirect if disconnected
  if (mounted && !isConnected) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ErrorBoundary>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ErrorBoundary>
  );
}

