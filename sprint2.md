# Prompt for an AI developer agent — implement Solana *Launch Token* sprint (MVP on **devnet**)

Use this prompt as-is. The goal: extend an existing **React + TypeScript (TSX) frontend** for **pepelab.me** so the app becomes a real blockchain solution (not just UI/IA). **Do not change existing UI animations, loading states or visual design** — integrate features as non-intrusive components/controls. Skip tests — focus on user flow and real transactions that appear in **Solana Explorer (devnet)**.

---

## High-level goal

Implement an end-to-end MVP flow where:

1. User connects Phantom (already implemented).
2. User clicks **Launch Token** (from AI-generated idea) → a real SPL token is created on **Solana devnet** and minted to the user wallet.
3. A simple on-chain Anchor program records the launch (`record_launch`) and exposes `create_token` entrypoint (minimal logic).
4. User can click **Add liquidity** which opens a DEX/aggregator (Jupiter) prefilled for the new token (devnet) or shows the steps to add liquidity.
5. All transactions must be executed on **devnet** and explorer links provided (e.g. `https://explorer.solana.com/tx/<SIG>?cluster=devnet`).
6. Provide clear fallbacks if a browser wallet cannot sign a particular flow (e.g., createMint): a dev script using a local keypair (never commit secrets).
7. Do not run any commands related to Anchor, Rust because in Windows laptop i don't have this dependecies just work on code, i will build it on linux later.
Important rules:

* **Devnet only**. Do not use mainnet or production keys anywhere.
* **Never** commit private keys / seed phrases.
* Preserve existing UI and animations — add components or hooks that plug into current screens.
* Provide clear run & deploy instructions and a PR summary with diffs.

---

## Tasks for the agent (implementable checklist)

### A — Repo changes & dependencies

1. Add dependencies (update `package.json` or install):

```
@solana/web3.js
@solana/spl-token
@solana/wallet-adapter-base
@solana/wallet-adapter-react
@solana/wallet-adapter-react-ui
@solana/wallet-adapter-wallets
axios
```

2. Add dev env var support: `REACT_APP_SOLANA_RPC_URL` default to `https://api.devnet.solana.com`.

### B — Wallet/context integration

3. Add or update `src/solana/WalletProvider.tsx` (wraps app with `ConnectionProvider` / `WalletProvider` for devnet). Use `PhantomWalletAdapter`. Export provider for `index.tsx` / `App.tsx`.

### C — Create “Launch Token” flow (frontend)

4. Add component `src/components/LaunchTokenButton.tsx` (or integrate input into existing UI) with props:

   * `name` (string), `symbol` (string), `supply` (number) — provided by AI idea.
   * `onStarted`, `onSuccess(mintAddress, txSig)`, `onError(error)` callbacks so it can plug into current UI animations and loaders.
5. Implementation details for `LaunchTokenButton`:

   * Attempt browser-based SPL token creation using `@solana/spl-token` JS helpers and wallet-adapter as signer (use `createMint`, `getOrCreateAssociatedTokenAccount`, `mintTo`).
   * Build the flow to create mint, create ATA for user, mint `supply` to user.
   * After each transaction, collect tx signature and show explorer link.
   * If Phantom or wallet rejects signing `createMint` (Signer mismatch / missing signTransaction), detect the error and fall back to server/dev-script approach (see below).
   * `LaunchTokenButton` MUST call `onSuccess` with the minted token's mint address and the tx signature for the mint transaction.

### D — Fallback dev script (if browser cannot sign createMint)

6. Add `dev-scripts/create-token-devnet.js` (node script, NOT storing keys in repo). This script is run *locally by developer* and requires the developer to provide a path to a local keypair file (excluded in .gitignore).

   * Script uses `@solana/web3.js` and `@solana/spl-token` to create mint & mint tokens to a provided wallet address.
   * Document clearly in README how to run this script (example: `node dev-scripts/create-token-devnet.js ~/my-keypair.json <recipientPubkey> "PEPELAB" "PEP" 1000000`).
   * Emphasize: script is dev-only and must not be used in CI or with committed keys.

### E — Anchor program (minimal on-chain program)

7. Add an Anchor project in repo (folder `anchor/pepelab_program/`) with a minimal program:

   * Instruction `record_launch(authority: Pubkey, mint: Pubkey, metadata_cid: Option<String>)` — stores who launched which mint and timestamp.
   * Optionally provide `create_token` instruction as a wrapper (it may be a NO-OP if token creation is done via SPL; primary purpose is to show an on-chain record).
   * Keep program minimal and secure (no token custody). Use an account `LaunchRecord` that stores mint, launcher, and unix timestamp.
8. Provide `Anchor.toml` and `Cargo.toml` and example build/deploy commands:

```bash
# inside anchor/pepelab_program
anchor build
anchor deploy --provider.cluster devnet
```

9. Provide a small JS client `src/solana/anchorClient.ts` to call the `record_launch` instruction after token creation. This should sign via the connected wallet (or require a server key for deploy-time calls if needed) and return tx signature.

### F — DEX / Jupiter integration

10. Add `src/components/AddLiquidityButton.tsx` that:

    * Builds a Jupiter swap URL or open Jupiter interface prefilled for mint ↔ USDC/USDT pair on devnet (if jupiter supports devnet; if not, provide instructions and fallback to showing steps to add liquidity).
    * For demo: provide a deep-link to `https://jup.ag/swap?inputMint=<MINT>&outputMint=<USDC_MINT>` and explain if devnet support is limited.
    * If Raydium has a UI path, provide an `Add liquidity` guidance modal with exact steps and explorer links.

### G — UI/UX and non-intrusive integration

11. Do not alter existing animations or loading UX. Use `onStarted`/`onSuccess`/`onError` hooks so the current UI can show spinners/progress bars.
12. Display prominently after success:

    * Mint address (copy button).
    * Mint tx signature with explorer link: `https://explorer.solana.com/tx/<SIG>?cluster=devnet`.
    * A link/button to `Add liquidity`.

### H — Docs & PR

13. Add `docs/SOLANA_LAUNCH.md` (or update README) with:

    * How to run locally (install deps, env var).
    * How to run dev-scripts with local keypair.
    * How to deploy Anchor program to devnet and update program ID in frontend.
    * Security note: never commit keys, dev-scripts are for local dev only.
    * Example explorer links and sample expected outputs.
14. Provide a PR description (copyable) with summary of changes, commit messages, and acceptance checklist.

---

## Minimal Anchor program example (skeleton) — include in prompt so agent can create it

**Rust (lib.rs)** — minimal illustrative code:

```rust
use anchor_lang::prelude::*;

declare_id!("REPLACE_WITH_PROGRAM_ID_AFTER_DEPLOY");

#[program]
pub mod pepelab_program {
    use super::*;
    pub fn record_launch(ctx: Context<RecordLaunch>, mint: Pubkey) -> Result<()> {
        let rec = &mut ctx.accounts.record;
        rec.launcher = *ctx.accounts.launcher.key;
        rec.mint = mint;
        rec.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RecordLaunch<'info> {
    #[account(init, payer = launcher, space = 8 + 32 + 32 + 8)]
    pub record: Account<'info, LaunchRecord>,
    #[account(mut)]
    pub launcher: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct LaunchRecord {
    pub launcher: Pubkey,
    pub mint: Pubkey,
    pub timestamp: i64,
}
```

Agent should produce this Anchor project, plus a script showing how to call `record_launch` (JS) using `@project-serum/anchor` + wallet-adapter provider.

---

## Fallback clarifications (very important)

* Browser wallets may not expose the required Signer interface for `createMint` via `@solana/spl-token` helpers. Agent must:

  1. **Try** in-browser signFlow first using wallet-adapter `signTransaction`.
  2. If not supported, **fall back** to creating and exposing a serialized transaction that user can sign, or document using `dev-scripts/create-token-devnet.js` to create the token for demo.
* Document exactly which wallets were tested (Phantom recommended) and any limitations.

---

## Acceptance criteria (must be demonstrable during demo/hackathon)

1. The app still renders with the existing UI/animations unchanged.
2. A connected Phantom wallet can click **Launch Token** (with name/symbol/supply provided by AI idea) and sign transactions.
3. A new SPL token mint appears on devnet and the minted tokens are in the user's wallet.
4. Explorer links for the mint/mint-tx/record\_launch-tx are provided and open with `?cluster=devnet`.
5. The Anchor program `record_launch` is deployed to devnet and a record tx signature is visible in the explorer after a launch.
6. **Add liquidity** action opens Jupiter (or guides user) for the created token.
7. Developer documentation (`docs/SOLANA_LAUNCH.md`) explains how to run and how to use the fallback script when needed.
8. PR includes diffs, commit messages, run instructions and a short demo checklist for the reviewer.

---

## Deliverables (what agent must return)

* Modified/created file list and unified diff / patch.
* New files: `src/solana/WalletProvider.tsx`, `src/components/LaunchTokenButton.tsx`, `src/solana/createToken.ts`, `src/solana/anchorClient.ts`, `dev-scripts/create-token-devnet.js`, `anchor/pepelab_program/*`, `docs/SOLANA_LAUNCH.md`.
* PR description text (copyable) including acceptance checklist and example run steps.
* Clear instructions how to update the frontend to use the deployed Anchor program ID (environment variable or config).
* If any functionality cannot be implemented in-browser, include an explicit explanation and the local dev-scripts to perform the missing action.

---

## Example run / demo steps to include in PR

1. `npm install`
2. `REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com npm start`
3. Switch Phantom to **Devnet** and fund via faucet.
4. Open AI-generated idea card and click **Launch Token**.
5. Sign the transaction in Phantom.
6. After success, click explorer link to view the mint / tx / record\_launch.
7. Click **Add Liquidity** → opens Jupiter prefilled (or shows step-by-step modal).

---

