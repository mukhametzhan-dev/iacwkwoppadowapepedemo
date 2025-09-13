import { 
  Connection, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction
} from '@solana/spl-token';
import type { WalletContextState } from '@solana/wallet-adapter-react';

export interface TokenCreationResult {
  mintAddress: string;
  signature: string;
  explorerUrl: string;
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  supply: number;
  decimals?: number;
}

/**
 * Creates a new SPL token using browser wallet signing
 * Falls back to manual transaction construction if createMint fails
 */
export async function createTokenWithWallet(
  connection: Connection,
  wallet: WalletContextState,
  params: TokenCreationParams
): Promise<TokenCreationResult> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  const { name, symbol, supply, decimals = 6 } = params;

  try {
    // Try the simple approach first
    return await createTokenSimple(connection, wallet, params);
  } catch (error) {
    console.warn('Simple token creation failed, trying manual approach:', error);
    
    // Fall back to manual transaction construction
    return await createTokenManual(connection, wallet, params);
  }
}

/**
 * Simple token creation using @solana/spl-token helpers
 */
async function createTokenSimple(
  connection: Connection,
  wallet: WalletContextState,
  params: TokenCreationParams
): Promise<TokenCreationResult> {
  const { supply, decimals = 6 } = params;

  if (!wallet.publicKey) {
    throw new Error('Wallet public key not available');
  }

  // Create mint
  const mint = await createMint(
    connection,
    wallet as any, // Type assertion for compatibility
    wallet.publicKey, // mint authority
    wallet.publicKey, // freeze authority
    decimals
  );

  // Get or create associated token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet as any,
    mint,
    wallet.publicKey
  );

  // Mint tokens to user
  const signature = await mintTo(
    connection,
    wallet as any,
    mint,
    tokenAccount.address,
    wallet.publicKey,
    supply * Math.pow(10, decimals)
  );

  return {
    mintAddress: mint.toBase58(),
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
  };
}

/**
 * Manual token creation by constructing transactions
 * More compatible with browser wallets
 */
async function createTokenManual(
  connection: Connection,
  wallet: WalletContextState,
  params: TokenCreationParams
): Promise<TokenCreationResult> {
  const { supply, decimals = 6 } = params;

  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }

  // Generate mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // Get minimum balance for rent exemption
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  // Create mint account
  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: mint,
    lamports,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize mint
  const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals,
    wallet.publicKey, // mint authority
    wallet.publicKey  // freeze authority
  );

  // Create transaction for mint creation
  const mintTransaction = new Transaction().add(
    createMintAccountInstruction,
    initializeMintInstruction
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  mintTransaction.recentBlockhash = blockhash;
  mintTransaction.feePayer = wallet.publicKey;

  // Partially sign with mint keypair
  mintTransaction.partialSign(mintKeypair);

  // Sign with wallet
  const signedMintTransaction = await wallet.signTransaction(mintTransaction);

  // Send mint creation transaction
  const mintSignature = await connection.sendRawTransaction(signedMintTransaction.serialize());
  await connection.confirmTransaction(mintSignature, 'confirmed');

  // Create associated token account
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey
  );

  const createATAInstruction = createAssociatedTokenAccountInstruction(
    wallet.publicKey, // payer
    associatedTokenAddress, // ata
    wallet.publicKey, // owner
    mint // mint
  );

  // Mint tokens to user
  const mintToInstruction = createMintToInstruction(
    mint,
    associatedTokenAddress,
    wallet.publicKey, // mint authority
    supply * Math.pow(10, decimals)
  );

  // Create transaction for minting
  const mintToTransaction = new Transaction().add(
    createATAInstruction,
    mintToInstruction
  );

  const { blockhash: blockhash2 } = await connection.getLatestBlockhash();
  mintToTransaction.recentBlockhash = blockhash2;
  mintToTransaction.feePayer = wallet.publicKey;

  // Sign with wallet
  const signedMintToTransaction = await wallet.signTransaction(mintToTransaction);

  // Send minting transaction
  const finalSignature = await connection.sendRawTransaction(signedMintToTransaction.serialize());
  await connection.confirmTransaction(finalSignature, 'confirmed');

  return {
    mintAddress: mint.toBase58(),
    signature: finalSignature,
    explorerUrl: `https://explorer.solana.com/tx/${finalSignature}?cluster=devnet`
  };
}

/**
 * Validates token creation parameters
 */
export function validateTokenParams(params: TokenCreationParams): string[] {
  const errors: string[] = [];

  if (!params.name || params.name.trim().length === 0) {
    errors.push('Token name is required');
  }

  if (!params.symbol || params.symbol.trim().length === 0) {
    errors.push('Token symbol is required');
  }

  if (params.symbol && params.symbol.length > 10) {
    errors.push('Token symbol must be 10 characters or less');
  }

  if (!params.supply || params.supply <= 0) {
    errors.push('Token supply must be greater than 0');
  }

  if (params.supply && params.supply > 1000000000) {
    errors.push('Token supply too large (max 1 billion)');
  }

  if (params.decimals !== undefined && (params.decimals < 0 || params.decimals > 9)) {
    errors.push('Decimals must be between 0 and 9');
  }

  return errors;
}

/**
 * Gets the explorer URL for a given transaction signature
 */
export function getExplorerUrl(signature: string, cluster: string = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

/**
 * Gets the explorer URL for a given mint address
 */
export function getMintExplorerUrl(mintAddress: string, cluster: string = 'devnet'): string {
  return `https://explorer.solana.com/address/${mintAddress}?cluster=${cluster}`;
}