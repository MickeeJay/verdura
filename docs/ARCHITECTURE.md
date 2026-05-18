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
