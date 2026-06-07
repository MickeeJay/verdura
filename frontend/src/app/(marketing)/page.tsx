"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { LiveStatsBar } from "@/components/LiveStatsBar";
import { Wallet, Lock, Coins, Shield, CheckCircle, Link2, Github, Twitter } from "lucide-react";
import Link from "next/link";
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
              Got questions? We&apos;ve got answers.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-slate-800 bg-slate-900/40 rounded-xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-slate-900/60 transition-all duration-300">
              <AccordionTrigger className="text-white hover:text-emerald-400 font-semibold hover:no-underline py-5 data-[state=open]:text-emerald-400 transition-colors">
                What is Verdura and how does it work?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                Verdura is a decentralized savings protocol built on Stacks that allows you to lock USD-denominated value into savings vaults. While locked, your capital generates yields powered by Stacks (STX) stacking and decentralized finance strategies, which are paid directly to your wallet in Bitcoin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-800 bg-slate-900/40 rounded-xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-slate-900/60 transition-all duration-300">
              <AccordionTrigger className="text-white hover:text-emerald-400 font-semibold hover:no-underline py-5 data-[state=open]:text-emerald-400 transition-colors">
                How does Verdura protect my savings from inflation?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                Traditional fiat savings lose significant value due to currency devaluation and high inflation. Verdura helps you hedge against this inflation by securing your capital in stable, USD-pegged digital assets, ensuring that your savings retain their purchasing power.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-800 bg-slate-900/40 rounded-xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-slate-900/60 transition-all duration-300">
              <AccordionTrigger className="text-white hover:text-emerald-400 font-semibold hover:no-underline py-5 data-[state=open]:text-emerald-400 transition-colors">
                How is the Bitcoin yield generated and when is it paid?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                Your savings are routed through secure, non-custodial smart contracts on the Stacks blockchain. These contracts leverage Stacks&apos; consensus mechanism (Proof of Transfer) to stack STX and interact with audited DeFi protocols. The yield generated is paid directly to your connected wallet in Bitcoin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-slate-800 bg-slate-900/40 rounded-xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-slate-900/60 transition-all duration-300">
              <AccordionTrigger className="text-white hover:text-emerald-400 font-semibold hover:no-underline py-5 data-[state=open]:text-emerald-400 transition-colors">
                Is Verdura safe and non-custodial?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                Yes, absolutely. Verdura is completely non-custodial and trustless. We never take custody of your private keys or funds. Your savings are locked in open-source, audited smart contracts on Stacks, and only you hold the keys to withdraw them once the lock period expires.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-slate-800 bg-slate-900/40 rounded-xl px-6 data-[state=open]:border-emerald-500/30 data-[state=open]:bg-slate-900/60 transition-all duration-300">
              <AccordionTrigger className="text-white hover:text-emerald-400 font-semibold hover:no-underline py-5 data-[state=open]:text-emerald-400 transition-colors">
                What wallets can I use and how do I get started?
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 pb-5 leading-relaxed">
                To get started, you will need a Stacks-compatible wallet like Leather or Xverse. Once you install the wallet extension or mobile app, fund it with STX or supported stable tokens, connect it to Verdura, and select your savings duration to establish your first vault.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-16 border-t border-slate-900 bg-slate-950 text-slate-400 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Col 1: Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 group cursor-pointer w-fit">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 transition-transform duration-300 group-hover:rotate-12">
                  V
                </div>
                <span className="text-lg font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">Verdura</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Securing your wealth in stable USD savings vaults while generating Bitcoin yield on the Stacks blockchain.
              </p>
            </div>

            {/* Col 2: Protocol */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Protocol</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://explorer.hiro.so/?chain=mainnet"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 transition-colors duration-200"
                  >
                    Stacks Explorer
                  </a>
                </li>
                <li>
                  <a href="#hero" className="hover:text-emerald-400 transition-colors duration-200">
                    Savings Vaults
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-400 transition-colors duration-200">
                    Yield Strategy
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="hover:text-emerald-400 transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-400 transition-colors duration-200">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="hover:text-emerald-400 transition-colors duration-200">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Community */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Community</h4>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/verdura"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-emerald-500/30 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300"
                  aria-label="Twitter / X"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/MickeeJay/verdura"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-emerald-500/30 hover:shadow-[0_4px_12px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Verdura. All rights reserved. Built with 💚 for savers globally.
            </p>
            <p className="text-xs text-slate-600">
              Verdura is a decentralized protocol. Deployed on Stacks L2.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
