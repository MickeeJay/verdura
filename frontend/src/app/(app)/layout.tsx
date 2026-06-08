"use client";

import React from "react";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
