"use client";

import React from "react";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
            Verdura Landing Page
          </h1>
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
