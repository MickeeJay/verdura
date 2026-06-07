import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
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
          Terms of Use
        </h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: June 7, 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Verdura decentralized application, you agree to comply with and be bound by these Terms of Use. If you do not agree, you must not use or access the services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Decentralized and Non-Custodial Nature</h2>
            <p>
              Verdura provides a decentralized user interface that interacts with open-source smart contracts deployed on the Stacks blockchain. You acknowledge that Verdura does not hold, custody, or manage your digital assets, private keys, or transactions. All transaction execution is managed directly by you via your connected wallet and the Stacks blockchain network.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Smart Contract and Blockchain Risks</h2>
            <p>
              You understand and agree that using decentralized protocols involves substantial risks, including but not limited to smart contract vulnerabilities, blockchain network congestion, forks, oracle failures, and general digital asset volatility. All interactions with the smart contracts are final and irreversible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. No Warranties</h2>
            <p>
              The Verdura interface and protocol are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
            <p>
              In no event shall Verdura, its developers, or contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages arising out of the use or inability to use the interface, even if advised of the possibility of such damages.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
