import { useEffect } from "react";

export const WALLET_KEY = "pepelab_preferred_wallet";

export function useWalletPersistence(walletName?: string) {
  useEffect(() => {
    if (!walletName) return;
    localStorage.setItem(WALLET_KEY, walletName);
  }, [walletName]);
}

export function getPreferredWallet(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(WALLET_KEY);
}

export function clearPreferredWallet(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WALLET_KEY);
}

export function setPreferredWallet(walletName: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WALLET_KEY, walletName);
}