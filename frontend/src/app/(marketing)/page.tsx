"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-24 pb-16 px-4 md:px-8 border-b border-slate-900/60 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_50%)]">
        <div className="container mx-auto max-w-5xl text-center flex flex-col items-center">
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
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-100">How It Works</h2>
        </div>
      </section>

      {/* Why Verdura Section */}
      <section id="why-verdura" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-slate-100">Why Verdura</h2>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-slate-900/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-slate-100">Frequently Asked Questions</h2>
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
