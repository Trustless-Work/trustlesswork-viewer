````md
# 🔐 Trustless Work - Escrow Viewer

A decentralized, read-only viewer for Soroban-based escrow contracts on the Stellar blockchain. This tool lets anyone inspect an escrow contract by its ID—displaying milestones, participants, roles, balances, and statuses in a clean and transparent UI.

Built with **Next.js 14**, **TailwindCSS**, and **ShadCN UI**. Fully responsive, theme-aware (light/dark), and designed for contributor scalability.

---

## 🚀 Features

- 🔎 **Search Escrow Contracts** – Enter a Soroban contract ID and load organized escrow data.
- 👤 **Role Breakdown** – View roles such as Approver, Release Signer, Receiver, Service Provider—each with tooltip explanations aligned to Trustless Work docs.
- 🧩 **Milestones** – Detailed milestone cards with approval states, amounts, descriptions, flags, and progress.
- 💰 **Live Token Balance** – Gets real-time balance from the token contract (if applicable).
- 📦 **Properties** – All escrow metadata (properties & flags) displayed clearly for auditing.
- 🧭 **Network Switching** – Switch between _testnet_ and _mainnet_.
- 🌗 **Full Dark Mode Support** – Theme uses semantic tokens for perfect readability.
- ⚛️ **Responsive Layout** – Mobile and desktop views with adaptive UI.
- ❌ **Read-Only Viewer** – No wallet, no signing, no transactions.

---

## 🏁 Getting Started

### Prerequisites

- Node.js **18+**
- Any modern package manager (npm, pnpm, yarn, bun)

### Installation

```bash
git clone <repository-url>
cd escrow-viewer
bun install   # or npm/yarn/pnpm install
```
````

### Run Development Server

```bash
bun dev    # or npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 🧪 Usage

1. Enter a **Soroban contract ID** into the search bar.
2. Press **Fetch**.
3. View:
   - Roles
   - Milestones
   - Flags
   - Contract properties
   - Token balance
   - Transaction history (optional tab)

Tooltips provide definitions for roles, fields, and flags.

---

## 🧱 Project Structure

```bash
src/
├── app/
│   ├── layout.tsx            # Global layout + theme + providers
│   ├── globals.css           # Tailwind + thematic CSS variables
│   ├── page.tsx              # Home + search interface
│   └── [id]/page.tsx         # Dynamic escrow viewer route
│
├── components/
│   ├── Navbar.tsx
│   ├── escrow/
│   │   ├── EscrowDetails.tsx          # Main orchestrator for escrow display
│   │   ├── escrow-content.tsx         # Shared contract content renderer
│   │   ├── desktop-view.tsx           # Desktop layout version
│   │   ├── search-card.tsx            # Contract ID input + actions
│   │   ├── header.tsx                 # Escrow header wrapper
│   │   ├── title-card.tsx             # Escrow title and summary
│   │   ├── LedgerBalancePanel.tsx     # Real-time on-chain balance
│   │   ├── error-display.tsx
│   │   ├── tab-view.tsx
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionDetailModal.tsx
│   │   └── welcome-state.tsx
│   │
│   ├── shared/
│   │   ├── detail-row.tsx            # Generic label/value row
│   │   ├── milestone-card.tsx        # Milestone structure + flags
│   │   ├── role-card.tsx             # Role details + copyable address
│   │   ├── role-icon.tsx
│   │   ├── section-card.tsx          # Reusable card wrapper
│   │   ├── status-panel.tsx
│   │   ├── status-badge.tsx
│   │   ├── progress-bar.tsx
│   │   ├── loading-logo.tsx
│   │   ├── network-toggle.tsx
│   │   └── info-tooltip.tsx
│   │
│   └── ui/                           # ShadCN primitive wrappers
│       ├── card.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── tooltip.tsx
│       ├── tabs.tsx
│       └── progress.tsx
│
├── contexts/
│   └── NetworkContext.tsx            # Manages testnet/mainnet
│
├── hooks/
│   ├── useEscrowData.ts              # Fetch + map escrow contract data
│   ├── useTokenBalance.ts            # Fetch live token balance
│   └── useIsMobile.ts                # Responsive hook
│
├── lib/
│   ├── escrow-constants.ts           # Tooltips, role maps, example IDs
│   ├── amount-format.ts
│   ├── network-config.ts
│   ├── rpc.ts                        # Soroban JSON-RPC client
│   ├── token-service.ts
│   └── utils.ts
│
├── mappers/
│   └── escrow-mapper.ts              # Converts raw RPC to structured object
│
└── utils/
    ├── animations/animation-variants.ts
    ├── ledgerkeycontract.ts
    ├── token-balance.ts
    └── transactionFetcher.ts
```

---

## 🎨 Theming

### Semantic Colors (Recommended)

All components use semantic Tailwind tokens like:

- `text-foreground`
- `text-muted-foreground`
- `bg-card`
- `text-card-foreground`
- `border-border`
- `bg-muted`
- `text-primary`

### Theme Definitions

Located in `globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.14 0.005 285.8);
  --primary: oklch(0.21 0.006 285.8);
}

.dark {
  --background: #000;
  --foreground: #7ee3ff;
  --primary: #0ea5ff;
}
```

These tokens provide consistent color across:

- Cards
- Detail rows
- Milestones
- Status panels
- Buttons
- Tooltips

---

## ⛓ Contract Data Flow

```
User enters ID → useEscrowData() → rpc.getLedgerEntries()
               → escrow-mapper.ts → organized escrow object
               → displayed in DesktopView / MobileView
```

Live balance:

```
useTokenBalance() → token-service.ts → Soroban RPC query
```

Transactions:

```
transactionFetcher.ts → operations involving the contract address
```

---

## 📡 Deployment

### Vercel

1. Push to GitHub
2. Import the repo into Vercel
3. Deploy

### IPFS / Web3 Hosting

```bash
npm run build
npm run export
```

Upload the `out/` directory to a provider like:

- Fleek
- Pinata
- Web3.Storage

---

## ✍️ Contributing

```bash
git checkout -b feat/my-feature
git commit -m "Add feature"
git push origin feat/my-feature
```

Then open a Pull Request against `main`.

### Guidelines

- Use semantic colors, not fixed hex values.
- Use existing component patterns (SectionCard, DetailRow, RoleCard, MilestoneCard).
- Framer Motion variants should live in `animation-variants.ts`.
- Keep network logic inside `NetworkContext`.

---

## 📚 Resources

- **Next.js Docs** — [https://nextjs.org/docs](https://nextjs.org/docs)
- **Soroban Docs** — [https://soroban.stellar.org/docs](https://soroban.stellar.org/docs)
- **ShadCN UI** — [https://ui.shadcn.com](https://ui.shadcn.com)
- **Stellar Explorer** — [https://stellar.expert](https://stellar.expert)

---

## 🛡 License

MIT — free to fork, build on, and contribute.

```

```
