"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { CreateVaultForm } from "@/components/vaults/CreateVaultForm";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

export default function CreateVaultPage() {
  const { isConnected, connect } = useWallet();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isConnected ? (
          <div className="w-full max-w-lg">
            <CreateVaultForm />
          </div>
        ) : (
          <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl text-center space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Wallet className="size-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Connect Your Wallet</h1>
              <p className="text-sm text-muted-foreground">
                To create a savings vault and customize yield options, please connect your Stacks wallet.
              </p>
            </div>
            <Button
              onClick={connect}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
