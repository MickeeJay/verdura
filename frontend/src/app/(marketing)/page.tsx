"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { LiveStatsBar } from "@/components/LiveStatsBar";
import { Wallet, Lock, Coins, Shield, CheckCircle, Link2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


export default function MarketingPage() {
  const { connect, isConnected } = useWallet();
  const router = useRouter();

  const handleStartSaving = () => {
    if (isConnected) {
      router.push("/dashboard");
    } else {
      connect();
    }
  };

  const comparisonPoints = [
    {
      category: "Currency Stability",
      icon: Shield,
      traditional: { label: "NGN Savings", detail: "Subject to 30%+ annual devaluation" },
      verdura: { label: "USD-Pegged Vaults", detail: "Stable value, immune to local inflation" },
    },
    {
      category: "Yield Type",
      icon: Coins,
      traditional: { label: "Fiat Interest", detail: "3–5% APY in depreciating currency" },
      verdura: { label: "Bitcoin Yield", detail: "Earn BTC, the hardest money on earth" },
    },
    {
      category: "Custody",
      icon: Lock,
      traditional: { label: "Custodial", detail: "Bank or fintech holds your funds" },
      verdura: { label: "Self-Custodied", detail: "You control your keys and your money" },
    },
    {
      category: "Verification",
      icon: Link2,
      traditional: { label: "Trust-Based", detail: "No way to independently audit balances" },
      verdura: { label: "On-Chain Proof", detail: "Every transaction verifiable on Stacks" },
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-24 pb-0 border-b border-slate-900/60 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]">
        <div className="container mx-auto max-w-5xl text-center flex flex-col items-center px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400 mb-6 tracking-wide uppercase">
            ⚡ Stacks Blockchain Powered
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-3xl leading-[1.15]">
            Save in <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Dollars</span>.<br className="sm:hidden" /> Earn in <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Bitcoin</span>.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
            Verdura secures your hard-earned wealth in inflation-proof USD savings vaults while generating premium yields paid directly to your wallet in Bitcoin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
            <Button
              onClick={handleStartSaving}
              size="lg"
              className="w-full sm:w-auto h-12 px-8 font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] transition-all duration-200"
            >
              Start Saving
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 font-semibold rounded-xl border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="mt-8">
          <LiveStatsBar />
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 md:px-8 bg-slate-900/30 border-b border-slate-900/60">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Start securing your financial future in three simple, decentralized steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] group">
              <div className="flex items-center justify-between mb-6">
                <div className="text-emerald-500/50 font-bold font-mono text-xl group-hover:text-emerald-400 transition-colors">01</div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Connect Wallet</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect your Stacks-compatible Web3 wallet (such as Leather or Xverse) securely in a single click. No passwords or sign-up forms are ever required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] group">
              <div className="flex items-center justify-between mb-6">
                <div className="text-emerald-500/50 font-bold font-mono text-xl group-hover:text-emerald-400 transition-colors">02</div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Lock className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Create a Savings Vault</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Establish a commitment-based vault by selecting your duration and locking in stable savings. Your funds remain secured directly on the blockchain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] group">
              <div className="flex items-center justify-between mb-6">
                <div className="text-emerald-500/50 font-bold font-mono text-xl group-hover:text-emerald-400 transition-colors">03</div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Coins className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Earn BTC Yield</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                While locked, your vault automatically routes to secure yield strategies. You collect passive returns denominated entirely in Bitcoin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Verdura Section */}
      <section id="why-verdura" className="relative py-24 px-4 md:px-8 border-b border-slate-900/60 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.04),transparent_50%)]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Verdura?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how Verdura compares to traditional savings platforms like Piggyvest and Nigerian bank accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonPoints.map((point) => {
              const Icon = point.icon;
              return (
                <div
                  key={point.category}
                  className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 md:p-8 transition-all duration-300 hover:border-emerald-500/30 group hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)]"
                >
                  {/* Subtle top border gradient */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{point.category}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Traditional */}
                    <div className="rounded-xl bg-slate-800/20 border border-slate-800/60 p-4 transition-all duration-300 group-hover:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Traditional</div>
                      <div className="text-sm font-semibold text-slate-400 mb-1">{point.traditional.label}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{point.traditional.detail}</p>
                    </div>

                    {/* Verdura */}
                    <div className="rounded-xl bg-gradient-to-b from-emerald-500/[0.03] to-emerald-500/[0.01] border border-emerald-500/10 p-4 transition-all duration-300 group-hover:border-emerald-500/20 group-hover:from-emerald-500/[0.06] group-hover:to-emerald-500/[0.02]">
                      <div className="flex items-center gap-1 mb-2">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verdura</div>
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{point.verdura.label}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{point.verdura.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 md:px-8 bg-slate-900/30 border-b border-slate-900/60">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400">
              Got questions? We've got answers.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Verdura?</AccordionTrigger>
              <AccordionContent>
                Verdura is a decentralized savings protocol.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-center text-slate-500 text-sm">© {new Date().getFullYear()} Verdura. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
