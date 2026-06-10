# Architecture Overview

Verdura is composed of a Next.js frontend and a set of Clarity smart contracts on the Stacks blockchain.

## System Diagram

```text
+-----------------------------------------------------------+
|                                                           |
|                       FRONTEND LAYER                      |
|                (Next.js 14, Stacks.js SDK)                |
|                                                           |
+----------------------------+------------------------------+
                             |
                             | (RPC / JSON-RPC 2.0)
                             |
+----------------------------v------------------------------+
|                                                           |
|                    SMART CONTRACT LAYER                   |
|                      (Stacks / Clarity)                   |
|                                                           |
|  +-------------------+  +------------------------------+  |
|  |                   |  |                              |  |
|  |   Vault Manager   |  |   Yield Strategy Adapter     |  |
|  |    (Core Logic)   <--+    (DeFi Integration)        |  |
|  |                   |  |                              |  |
|  +---------+---------+  +--------------+---------------+  |
|            |                           |                  |
|            |                           |                  |
|  +---------v---------+                 |                  |
|  |                   |                 |                  |
|  |   Registry / DAO  |                 |                  |
|  | (Config & Governance) <--------------+                  |
|  |                   |                                    |
|  +-------------------+                                    |
|                                                           |
+-----------------------------------------------------------+
```

## Core Components

### 1. Frontend Layer
- **App Router**: Handles routing and server-side rendering.
- **Stacks.js**: Facilitates wallet connection, transaction signing, and data retrieval from the blockchain.
- **shadcn/ui**: Provides the UI component foundation.

### 2. Smart Contract Layer
- **Vault Manager**: Handles the creation, locking, and withdrawal of savings vaults.
- **Yield Strategy Adapter**: Interfaces with Stacks DeFi protocols (like Alex or Zest) to generate BTC-denominated yield.
- **Registry / DAO**: Manages global configuration, supported tokens, and protocol governance.
- **Savings Profile Ledger (savings-profile.clar)**: Acts as an append-only ledger that stores user profile stats (e.g. member-since, total-saved, total-yield-earned, total-vaults-completed, last-vault-block) and calculates savings streaks and gamified leaderboard scores.

## Security Architecture & Controls

Verdura incorporates multi-layered security controls across the smart contract and frontend layers:

1. **Static Authorization Binding**: Key updates on `savings-profile.clar` are restricted to the deployer-owned `.savings-vault` address using static principal comparison.
2. **Anti-Phishing / Spoofing Defenses**: Stacks admin methods verify `contract-caller` against the contract owner instead of `tx-sender`, preventing malicious proxy contracts from performing unauthorized configuration modifications.
3. **HTTP Hardening & CSP**: The Next.js frontend injects a unique cryptographically secure nonce on every page load to block unauthorized script execution via inline script injections (XSS).
4. **State Invariant Audits**: The read-only helper `check-invariants` verifies the integrity of deposit shares between local records and DeFi routing endpoints.
5. **Precision Protections**: Explicit guards prevent zero-amount transactions from generating zero shares or bypassing lock bounds.
