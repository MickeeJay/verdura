"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

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

  return <>{children}</>;
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
