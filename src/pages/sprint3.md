# Prompt for an AI developer agent — implement **“Launch Token”** feature in pepelab.me (React + TypeScript, Web3, devnet)

You are an AI developer. Your task: **add a production-ready “Launch Token” flow to the existing pepelab.me frontend** and wire it to the existing backend API. Work must *not* change visual design, animations, or existing loading components — integrate non-intrusively (use hooks/callbacks so existing UI/animations keep working). Deliver code patches / file diffs, and a short PR summary with run and test instructions.

Below are detailed requirements, API examples, code guidance, and acceptance criteria. Implement exactly — backend is already available at `http://144.124.225.79:3001` (devnet). All blockchain actions and explorer links must use **Solana devnet**.

---

## High-level feature summary (what to build)

* Add **Launch Token** action to the main menu / Solana Integration Demo area.
* Provide UI for selecting an AI-generated template or manual entry of fields:

  * Token Name, Token Symbol, Supply, Decimals, Token Logo (image), Description, Social links, Initial Liquidity (SOL), Percentage for pool.
* When user clicks **Launch**, frontend sends a request to backend `POST /api/token/create-with-pool` (or `/api/token/create`) as documented. Backend can take up to **20 seconds**; during that time show the existing loading component/animation (you must reuse it).
* After success show a **Congratulations** screen with nice animation (hook into existing animation component) and show links to Solana Explorer (mint address, mint tx, record\_launch tx, pool if present) with `?cluster=devnet`.
* All calls must use devnet and explorer links must include `?cluster=devnet`.
* Keep UI compatible with existing styles, animations and layouts. Do not change global styles or animation components.

---

## Implementation tasks (detailed)

### A — UI additions & integration points

1. **Menu & Section**

   * Add a “Launch Token” button to the existing Solana Integration Demo section (or main menu) — or add a new card under that section visually consistent with your current UI.
   * The new UI MUST reuse existing layout classes and components (Tailwind, shadcn components, etc.) so nothing breaks visually.

2. **Launch Modal / Panel**

   * Implement a `LaunchTokenModal` component (TSX) that:

     * Displays AI-generated templates (list of cards) at top — these are prefilled forms user can pick.
     * Shows a form with the fields below (prefill when user selects a template).
     * Allows uploading a token logo image (accept WEBP/PNG/GIF/JPG) — send to backend as `multipart/form-data` if `image` is required by API; otherwise accept base64 and send to API as needed.
     * Uses your existing file input styles and validation (max size, recommended dimensions) — show validation errors inline.

   * Fields (exact):

     * `name` (string, required)
     * `symbol` (string, required, up to \~10 chars)
     * `initialSupply` (number, required)
     * `decimals` (number, default 9)
     * `description` (string, optional)
     * `socialLinks` (array / CSV string, optional)
     * `initialLiquidity` (number, optional) — SOL amount to seed pool
     * `percentage` (number, optional) — % of supply to put into pool
     * `image` (file, optional)

3. **LaunchTokenButton component**

   * Create `src/components/LaunchTokenButton.tsx` (or fold into modal) containing:

     * `onStarted()` callback — call it immediately before sending request so parent can trigger loading animation.
     * `onSuccess(response)` callback — call on success with the backend response (full JSON).
     * `onError(error)` callback.

4. **Wallet persistence fix (index.tsx)**

   * You already have wallet integration in `index.tsx`. Implement persistence: when the user selects **Phantom** (or any supported wallet) store the chosen wallet ID in `localStorage` (e.g., `pepelab_preferred_wallet = "Phantom"`). Enable `autoConnect` if preferred wallet is present.
   * Example approach: in `WalletProvider.tsx` use `useMemo` wallets list and `autoConnect = Boolean(localStorage.getItem('pepelab_preferred_wallet'))`. On wallet selection event, write the selection. Do not change existing UI visuals — only add persistence.

5. **Use existing WalletInfo component**

   * Use `WalletInfo` component (already present) as the wallet connect UI. If a new wallet selection UI exists, make sure it writes the persisted wallet name.

### B — Client → Backend integration

1. **API endpoint**

   * Use `POST http://144.124.225.79:3001/api/token/create-with-pool`.
   * Content-Type: `application/json` (or `multipart/form-data` if sending image).
   * Example request body (JSON):

     ```json
     {
       "name": "AI Sultan V3",
       "symbol": "AIS2",
       "description": "Sultan of memes V3",
       "decimals": 9,
       "initialSupply": 1000000,
       "initialLiquidity": 0.1,
       "percentage": 50
     }
     ```
   * If image upload required: use `FormData` and `fetch` / `axios` `multipart/form-data`.

2. **Request/Response handling**

   * When user clicks Launch:

     1. Validate inputs on client.
     2. Call `onStarted()` to trigger loading UI.
     3. Send POST to backend.
     4. Backend can take up to **20s**. Keep the spinner/loader until a final response or until timeout (see below).
     5. If 200 OK: JSON with `{ mint, name, symbol, decimals, initialSupply, tokenAccount, pool: {...}, initialPrice }`.
     6. Show Congratulations screen with data and Explorer links:

        * Mint address explorer: `https://explorer.solana.com/address/<mint>?cluster=devnet`
        * Example tx explorer (if backend returns tx id): `https://explorer.solana.com/tx/<txid>?cluster=devnet`
        * Program id or pool tx as provided.
   * Errors:

     * If API returns a non-200, show clear error message and allow retry.
     * If network error or timeout (>25s), show friendly message: "Launch failed — backend timed out. Please try again or run the dev script" and surface logs for debugging.

3. **Timeout & retries**

   * Set HTTP client timeout to \~30s.
   * No automatic retries for POST (safe to avoid duplicate minting). Instead provide “Retry” button that repeats the flow (user must confirm).

4. **Security**

   * No private keys in frontend. All signing must happen via Phantom as implemented in backend flow (if backend requests client signatures, implement appropriate flow). For this task assume backend performs on-chain actions and uses server-side key or wallet; frontend just triggers and the backend returns minted mint and tx id.
   * Ensure calls go to `http://144.124.225.79:3001` (or `https` if provided). Allow override via env var `VITE_BACKEND_URL`.

### C — UX: loader → success screen

1. **Loading**

   * When sending POST call, call `onStarted()` and show existing animation: “Signing smart contracts…”. Keep this visible while waiting for response (up to 20s). Do not replace or modify the loading component — call it and pass state events so current UI handles animations.
2. **Success**

   * On success call `onSuccess(response)` and show full-screen (or modal) congratulations with:

     * Big animated “Congratulations! Your token launched 🎉”
     * Mint address (copy button)
     * Links: Mint explorer link, tx explorer link (if present), pool link
     * Button: “Open in Explorer” (opens new tab)
     * Button: “Add Liquidity” (prefills Jupiter link if applicable)
     * Button: “View my tokens” (navigates to existing token list UI)
3. **Failure**

   * On error call `onError(error)` and show a clear error modal with retry and contact support instructions.

### D — Explorer links & DEX

1. Explorer base: `https://explorer.solana.com/... ?cluster=devnet`.
2. For Add Liquidity: prefill Jupiter (if devnet supported) or show step-by-step instructions. Provide deep link:

   * Example (if plugin supports devnet): `https://jup.ag/swap?inputMint=<SOL_MINT>&outputMint=<MINT>` (document fallback).
3. If pool info returned, show pool address and LP mint.

### E — Developer ergonomics: code & files to create

Create/modify these files (suggested):

* `src/components/LaunchTokenModal.tsx` — modal + form + templates grid.
* `src/components/LaunchTokenButton.tsx` — button wrapper (calls backend, exposes callbacks).
* `src/services/api/token.ts` — API client wrapper using axios (reads `VITE_BACKEND_URL`).
* `src/hooks/useWalletPersistence.ts` — helper to persist wallet selection.
* `src/pages/SolanaIntegrationSection.tsx` — integrate the new button/modal into existing section (or modify existing section to add button).
* Update `src/index.tsx` / `src/WalletProvider.tsx` to support persisted wallet selection (autoConnect).
* Add small CSS/scoped styles only if needed, reuse existing classnames.

### F — Example code snippets (copy/paste ready)

**API client (axios)** — `src/services/api/token.ts`

```ts
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://144.124.225.79:3001";

export const createTokenWithPool = (payload: any, file?: File) => {
  if (file) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("image", file);
    return axios.post(`${BASE}/api/token/create-with-pool`, fd, { timeout: 40000 });
  } else {
    return axios.post(`${BASE}/api/token/create-with-pool`, payload, { timeout: 40000 });
  }
};
```

**Launch logic (simplified)** — `src/components/LaunchTokenButton.tsx`

```tsx
import React from "react";
import { createTokenWithPool } from "../services/api/token";

export const LaunchTokenButton: React.FC<{
  payload: any;
  file?: File | null;
  onStarted?: () => void;
  onSuccess?: (resp: any) => void;
  onError?: (err: any) => void;
}> = ({ payload, file, onStarted, onSuccess, onError }) => {
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    try {
      onStarted?.();
      setLoading(true);
      const res = await createTokenWithPool(payload, file);
      onSuccess?.(res.data);
    } catch (err) {
      onError?.(err);
      console.error("Launch failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn-primary" onClick={run} disabled={loading}>
      {loading ? "Launching..." : "Launch Token"}
    </button>
  );
};
```

**Wallet persistence hook** — `src/hooks/useWalletPersistence.ts`

```ts
import { useEffect } from "react";

export const WALLET_KEY = "pepelab_preferred_wallet";

export function useWalletPersistence(walletName?: string) {
  useEffect(() => {
    if (!walletName) return;
    localStorage.setItem(WALLET_KEY, walletName);
  }, [walletName]);
}

export function getPreferredWallet() {
  return localStorage.getItem(WALLET_KEY);
}
```

**WalletProvider changes (index.tsx)** — sketch:

```tsx
import { getPreferredWallet } from "./hooks/useWalletPersistence";
const preferred = getPreferredWallet();
// wallets list same as before (PhantomWalletAdapter etc.)
<WalletProvider wallets={wallets} autoConnect={Boolean(preferred)}>
  ...
</WalletProvider>
```

When user selects Phantom, write `localStorage.setItem(WALLET_KEY,"Phantom")`.

---

## Acceptance criteria / QA checklist (what I will test)

1. Launch button visible in Solana Integration Demo section, consistent with UI.
2. Clicking opens modal with templates and form. Selecting template pre-fills fields.
3. Uploading image validated (format and size) and included in request when provided.
4. Clicking Launch triggers `onStarted()` and shows existing loading animation for up to 20s.
5. Backend `POST /api/token/create-with-pool` is called with correct payload and file if provided.
6. On 200 response, show Congratulations screen with:

   * Mint address (copy)
   * Explorer link(s) with `?cluster=devnet`
   * Pool info and Add Liquidity action
7. Errors: show readable message and allow Retry.
8. Wallet persistence: selecting Phantom persists across page reloads (user remains connected if Phantom unlocked).
9. No changes to global UI animations or layout (visual regression check).

---

## Edge cases & clarifications (implement sensible defaults)

* If backend returns `isPlaceholder:true` (pool not created), still show mint + tx. Show a note that liquidity is placeholder and needs user action.
* If backend returns tx ID, show tx explorer link; if missing, show mint explorer and explain delay.
* If file upload fails, allow launching without image but warn user.

---

## Deliverables (what to return)

* Modified/created files (diffs/patches).
* PR description including: how to run frontend, env vars (`VITE_BACKEND_URL`), how to test the launch flow (step-by-step).
* A short demo script: “connect wallet → pick template → launch → show explorer”.
* If any backend limitations or UX compromises were needed (e.g., cannot sign in-browser), describe them clearly.

---

## Non-goals / constraints

* Do not change overall styling, animations, or existing loader component internals — integrate via callbacks and state only.
* Do not implement full DEX/AMM on frontend — only provide Add Liquidity deep link or guided steps.
* Assume backend handles on-chain actions; frontend acts as trigger/visualizer.

---

## Final notes for the agent

* Use TypeScript and the same React stack as project. Follow existing linting patterns.
* Keep code modular, export `onStarted/onSuccess/onError` hooks so existing UI reuses loading animations and success animation.
* Use `VITE_BACKEND_URL` environment var so testers can point to local or remote backend. Default to `http://144.124.225.79:3001`.
* Make explorer links absolute and include `?cluster=devnet`.

---

Implement this feature fully, run locally against the provided backend, and return code diffs + README update and a 1-paragraph summary of any unresolved items or assumptions.
