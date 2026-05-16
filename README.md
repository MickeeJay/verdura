# Verdura

![Status: In Development](https://img.shields.io/badge/Status-In%20Development-yellow)

Verdura is a Bitcoin-backed commitment savings dApp built on Stacks (Bitcoin L2). Users lock stablecoins (USDCx / sBTC) into named, time-locked savings vaults, earn BTC-denominated yield via integrated Stacks DeFi protocols while their funds are locked, and build a verifiable on-chain savings history secured by Bitcoin. The product targets Nigerian and African stablecoin holders who currently hold idle USDT/USDC on exchanges earning zero yield.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | [Stacks](https://www.stacks.co/) |
| Smart Contracts | [Clarity 4](https://docs.stacks.co/clarity) |
| Frontend | [Next.js 14](https://nextjs.org/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |

## Project Structure

```
verdura/
├── frontend/          # Next.js 14 App Router application
├── contracts/         # Clarinet workspace with Clarity smart contracts
├── docs/              # Architecture and design documentation
├── CONTRIBUTING.md    # Contribution guidelines
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- [Clarinet](https://github.com/hirosystems/clarinet) (for smart contract development)

### Development

```bash
# Install frontend dependencies
npm --prefix frontend install

# Start the development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## License

MIT
