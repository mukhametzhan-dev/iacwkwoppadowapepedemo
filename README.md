# English prompt for an AI developer agent — integrate Solana into a React + TypeScript frontend (MVP)

You are an AI developer. You have access to a React + TypeScript (TSX) repository. Your task is to extend the frontend to add a minimal, safe, working MVP for Solana integration (use **devnet** only). Changes should be delivered as small, well-typed code pieces, with clear instructions, tests and a PR summary. Do the steps below and return changed files / diffs / run instructions and an acceptance checklist.

---

## 0) Global rules

* Use **devnet** by default: `https://api.devnet.solana.com`. Do **not** use mainnet.
* Never store private keys / seed phrases in the repo. All user signing must go through a browser wallet (Phantom or others) using `@solana/wallet-adapter`.
* TypeScript only. Respect types and linting norms.
* Provide clear commits and one PR summary.
* Provide step-by-step run instructions (install deps, start dev server).
* Add minimal unit/integration tests using Jest + React Testing Library (mock web3 interactions).
* Explain any fallback if a browser wallet cannot sign a specific flow (e.g., createMint).

---

## 1) Locate project root

* Find `package.json` and the `src/` directory.
* Use `yarn` if project uses Yarn, otherwise `npm`.

---

## 2) Add dependencies

Update `package.json` (or install) adding these dependencies:

```
@solana/web3.js
@solana/spl-token
@solana/wallet-adapter-base
@solana/wallet-adapter-react
@solana/wallet-adapter-react-ui
@solana/wallet-adapter-wallets
axios
```

Add devDeps for tests if missing:

```
@testing-library/react
@testing-library/jest-dom
jest
ts-jest
```

Example install command (npm):

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
