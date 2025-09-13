# PepeLab.me - Solana Meme Token Platform

A React + TypeScript frontend for creating and analyzing meme tokens on Solana devnet.

## 🚀 Features

- **Token Launch**: Create SPL tokens on Solana devnet with backend API integration
- **Phantom Wallet**: Real wallet connection with balance display and localStorage persistence  
- **Analytics Dashboard**: Interactive price charts and market data for trending meme coins
- **Meme-Coin Dashboard**: Visualize how meme-coins are generated from trends and social media
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS and shadcn/ui components

## 📊 Dashboard Page

### Viewing Dashboard

Access the meme-coin dashboard at:
- **URL**: `http://localhost:8080/dashboard` 
- **Navigation**: Click "Dashboard" in the header menu

### Layout (2x2 Grid)

**Row 1:**
- **Trend Radar**: Interactive radar showing trending topics with meme potential (FROG + SPACE, MOON CATS, etc.)
- **Concept Showcase**: Featured MOON FROG concept with Risk (35%) and Hype Potential (92%) metrics

**Row 2:**
- **Analytics Hub**: Success similarity scores for WIF (85%), BONK (78%), PEPE (66%) with progress bars
- **Launch Card**: Green LAUNCH button to simulate token creation from concepts

### Features

- **Interactive Radar**: Click trend points to see source data from Twitter, Reddit, news
- **Real-time Metrics**: Risk assessment and hype potential analysis
- **Success Patterns**: Compare with successful Solana meme coins
- **Launch Simulation**: Working launch button with loading states and navigation

### Demo Script

1. **Open Dashboard**: Navigate to `http://localhost:8080/dashboard`
2. **Explore Trends**: Click on "FROG + SPACE" point in the radar to see viral sources
3. **View Concept**: Review MOON FROG metrics and risk/hype assessment
4. **Check Analytics**: See how concept compares to successful coins like WIF, BONK
5. **Launch Token**: Click green LAUNCH button to simulate deployment
6. **Launch Flow**: Watch loading animation and redirect to launch page

## 📊 Analytics Page

### Viewing Analytics

Access the analytics section at:
- **URL**: `http://localhost:8080/analytics` 
- **Navigation**: Click "Analytics" in the header menu
- **Direct Link**: `/#analytics` redirects to `/analytics`

### Features

- **4 Meme Coins**: TRUMP, PEPE, DOGE, WOJ with real-time mock data
- **Interactive Charts**: Price charts with 1D/7D/30D/90D timeframes
- **Market Metrics**: Market cap, volume, TVL, and 24h change data
- **Sparklines**: Mini charts on each card showing price trends
- **Deep Linking**: Share specific coins with `?coin=trump` URL parameter
- **Explorer Links**: Direct links to Solana Explorer on devnet

## 🛠️ Development

### Setup

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:8080`

### Testing

```bash
npm test
```

### Project Structure

```
src/
├── components/
│   ├── TrendRadar.tsx         # Interactive trend radar visualization
│   ├── ConceptCard.tsx        # Meme concept showcase with metrics
│   ├── AnalyticsHub.tsx       # Success comparison with progress bars
│   ├── LaunchCard.tsx         # Token launch simulation button
│   ├── MemeCard.tsx           # Individual meme coin cards
│   ├── MemeDetail.tsx         # Detail modal with charts
│   ├── PriceChart.tsx         # Interactive price charts
│   ├── Sparkline.tsx          # Mini sparkline charts
│   └── SimplePhantomWallet.tsx # Wallet connection
├── data/
│   ├── dashboard.json         # Dashboard trend and concept data
│   └── analytics-memes.json   # Static meme coin data
├── pages/
│   ├── Dashboard.tsx          # Meme-coin dashboard
│   ├── Analytics.tsx          # Analytics dashboard
│   └── Index.tsx             # Home page
└── assets/
    └── memes/                # Meme coin logos
```

## 📱 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts library
- **Routing**: React Router v6
- **Wallet**: @solana/web3.js (display only)
- **Build**: Vite

## 🔗 Navigation

- **Home** (`/`): Token launch demo and main sections
- **Dashboard** (`/dashboard`): Meme-coin trend analysis and concept showcase
- **Analytics** (`/analytics`): Meme coin analytics dashboard
- **Wallet**: Phantom wallet connection in header

## 📊 Data

All dashboard and analytics data is static and stored in JSON files. No external APIs are called for the dashboard functionality.

---

# Original Solana Integration Guide

```bash
npm install @solana/web3.js @solana/spl-token @solana/wallet-adapter-base \
  @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets axios
npm install --save-dev @testing-library/react @testing-library/jest-dom jest ts-jest
```

---

## 3) Add wallet provider

Create `src/solana/WalletProvider.tsx`. It must:

* Provide `ConnectionProvider` and `WalletProvider` for devnet.
* Use Phantom wallet (via `PhantomWalletAdapter`) and `autoConnect=false`.
* Export a React component that wraps children.

Suggested content:

```tsx
import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = "https://api.devnet.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
```

Wrap your app root (`src/index.tsx` or `src/App.tsx`) with this provider.

---

## 4) Wallet connect + balance component

Add `src/components/WalletInfo.tsx`. It must:

* Use `WalletMultiButton` from wallet-adapter UI.
* Use `useConnection` and `useWallet` hooks.
* Display connected address and SOL balance (formatted).

Example:

```tsx
import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const WalletInfo: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!publicKey) { setBalance(null); return; }
    let mounted = true;
    (async () => {
      const lamports = await connection.getBalance(publicKey);
      if (!mounted) return;
      setBalance(lamports / 1e9);
    })();
    return () => { mounted = false; };
  }, [publicKey, connection]);

  return (
    <div>
      <WalletMultiButton />
      {publicKey && <div>Address: {publicKey.toBase58()}</div>}
      {balance !== null && <div>SOL: {balance.toFixed(6)}</div>}
    </div>
  );
};
```

---

## 5) Token list: show SPL tokens of connected user

Add `src/components/TokenList.tsx`. Requirements:

* Use `connection.getParsedTokenAccountsByOwner` for program id `Tokenkeg...`.
* Parse token accounts and show for each token: `mint`, `uiAmount` or `amount`, and token metadata if available.
* Handle loading & empty states and errors.

Suggested minimal code:

```tsx
import React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export const TokenList: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!publicKey) { setTokens([]); return; }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });
        if (!mounted) return;
        const parsed = resp.value.map(v => v.account.data.parsed.info);
        setTokens(parsed);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [publicKey, connection]);

  if (!publicKey) return <div>Connect wallet to see tokens</div>;
  if (loading) return <div>Loading tokens...</div>;
  if (!tokens.length) return <div>No tokens found (only SOL)</div>;

  return (
    <div>
      {tokens.map((t) => (
        <div key={t.mint}>
          <div>{t.tokenAmount.uiAmountString ?? t.tokenAmount.amount} — {t.mint}</div>
        </div>
      ))}
    </div>
  );

};
```

---

## 6) Create test token (devnet)

Add `src/components/CreateTokenButton.tsx`. Requirements:

* Implement a button that creates an SPL token mint and mints a small amount to the connected user **on devnet**.
* Use `@solana/spl-token` JS utilities where possible and wallet-adapter as signer.
* If direct createMint signature from browser wallet is not possible for the chosen wallet adapter, include a well-documented fallback:

  * Option A: create a server-side script (separate from repo or as a dev script) that is run manually (uses a dev keypair NOT committed to repo).
  * Option B: instruct how to run `spl-token` CLI locally to create token and paste the mint into UI for the demo.
* Show returned mint address and a link to explorer with `?cluster=devnet`.

Pseudo implementation hint:

```ts
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

async function createTokenAndMint(connection, wallet, decimals = 6, amount = 1000) {
  // wallet must act as Signer; handle errors if wallet lacks required methods.
  const mint = await createMint(connection, wallet as any, wallet.publicKey, null, decimals);
  const ata = await getOrCreateAssociatedTokenAccount(connection, wallet as any, mint, wallet.publicKey);
  await mintTo(connection, wallet as any, mint, ata.address, wallet.publicKey, amount * Math.pow(10, decimals));
  return mint.toBase58();
}
```

Document chosen approach in PR and README.

---

## 7) Integrate Jupiter (top tokens)

* Add `src/services/jupiter.ts` with a function that fetches token list from Jupiter price API (`https://price.jup.ag/v4/tokens` or current endpoint).
* Expose a `getTopTokens()` that returns tokens with price/liquidity.
* Add `src/components/TopMemeTokens.tsx` that:

  * Calls the service, filters tokens by keywords (`pepe`, `doge`, `meme`, `wojak`) and sorts by volume/liquidity.
  * Displays top 10 tokens with `symbol`, `name`, `price`.

Note: if Jupiter endpoint version is different, agent must check and use the correct endpoint. (Use axios for HTTP.)

---

## 8) Tests

* Add tests for `WalletInfo` and `TokenList` using Jest + React Testing Library:

  * Mock `useWallet` and `useConnection`.
  * Mock `connection.getParsedTokenAccountsByOwner`.
  * Verify the components render button, address and token rows.
* Add instructions to run tests: `npm test`.

---

## 9) Documentation

Add `docs/SOLANA_INTEGRATION.md` (or update README) with:

* Install commands
* How to run dev server with `REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com npm start`
* How to get Phantom and connect to devnet
* How to test "Create Test Token" (CLI fallback commands if applicable)
* Security notes: never commit private keys; recommended audit steps for programs.

Include example CLI commands if using `spl-token` as fallback:

```bash
# create a token locally (devnet)
spl-token create-token --url https://api.devnet.solana.com
spl-token create-account <MINT> --url https://api.devnet.solana.com
spl-token mint <MINT> 1000 --url https://api.devnet.solana.com
```

---

## 10) Acceptance criteria (MVP)

When PR is ready, verify:

1. App has UI to connect wallet (Phantom) and show SOL balance.
2. App shows connected user's SPL token list.
3. Create Test Token button returns a mint address (devnet) and link to explorer.
4. Top Meme Tokens component fetches from Jupiter and shows at least 5 filtered tokens.
5. README/docs explain how to run and test.
6. Simple tests exist for WalletInfo and TokenList and pass.

---

## 11) Deliverables (what to return)

* List of modified/created files and diffs (patch).
* A PR description with how-to-run, tests, and any manual steps (CLI / server script).
* If any feature is not possible due to wallet limitations in browser, explain fallback in PR and include a script or CLI commands to perform required steps.
* `docs/SOLANA_INTEGRATION.md` with short security checklist and next steps (Anchor, DEX integration).

---

## Extra notes for the agent

* Keep code minimal and readable. Add in-code comments where flows are non-trivial.
* Use `explorer` links with cluster parameter for demo:
  `https://explorer.solana.com/address/<ADDRESS>?cluster=devnet`
* If you create a server-side demo script, mark it `dev-scripts/create-token-devnet.js` and require the developer to run it locally with their own keypair (do not commit secrets).
* If you implement `createMint` in-browser and a wallet rejects signing, detect and surface a clear error message with the guided fallback.
* Provide step-by-step verification checklist for reviewers.

---
