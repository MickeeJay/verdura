import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-24 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: June 7, 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>
              Welcome to Verdura. We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you access our decentralized web application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. No Personal Identification Information</h2>
            <p>
              Verdura is a non-custodial decentralized application. We do not require or collect personal identification information such as your name, email address, physical address, or phone number. You interact with the protocol solely using your Stacks wallet address.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Data Collection</h2>
            <p>
              While we do not collect personal data, we may process:
            </p>
            <ul className="list-disc list-inside pl-4 space-y-1 text-slate-400">
              <li>Public blockchain information: wallet addresses, transactions, and vault events.</li>
              <li>Local cache data: settings or state stored locally in your browser.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. No Custody of Funds</h2>
            <p>
              We do not store, manage, or have access to your private keys, seed phrases, or funds. Your funds are held within smart contracts on the Stacks blockchain, which you control through your wallet.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated modification date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
