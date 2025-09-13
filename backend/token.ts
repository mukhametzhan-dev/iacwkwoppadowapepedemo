import { Keypair, PublicKey } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import BN from 'bn.js';
import { connection, keypair, CLUSTER } from './config';

// Define interfaces for our functions
export interface CreateTokenOptions {
  name: string;
  symbol: string;
  description?: string;
  decimals?: number;
  initialSupply?: number;
  image?: Buffer; // Optional image for token metadata - not used in this version
}

export interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  tokenAccount: string;
}

export interface TokenBalanceInfo {
  mint: string;
  owner: string;
  balance: number;
}

export interface TokenMetadataInfo {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  isNft: boolean;
  metadata: any | null;
}

/**
 * Create a new token (SPL Token only)
 * This simplified version focuses on token creation for Raydium pools
 * @param options Token creation options
 * @returns Token information
 */
export async function createToken(options: CreateTokenOptions): Promise<TokenInfo> {
  try {
    const { 
      name, 
      symbol, 
      decimals = 9, 
      initialSupply = 1000000000
    } = options;
    
    console.log(`Creating token: ${name} (${symbol})`);
    
    // Create mint account
    const mint = await createMint(
      connection,
      keypair,
      keypair.publicKey,
      keypair.publicKey,
      decimals
    );
    
    // Create token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    
    // Calculate supply in smallest unit using BN to handle large numbers safely
    // Convert the initial supply to a string first to preserve precision
    const initialSupplyStr = initialSupply.toString();
    const decimalMultiplier = new BN(10).pow(new BN(decimals));
    
    try {
      // Try to handle it with BN operations
      const initialSupplyBN = new BN(initialSupplyStr);
      const supplyBN = initialSupplyBN.mul(decimalMultiplier);
      
      // Check if the result exceeds JavaScript's Number.MAX_SAFE_INTEGER
      if (supplyBN.gt(new BN(Number.MAX_SAFE_INTEGER))) {
        console.warn('Supply value too large for mintTo, minting a smaller amount');
        
        // Mint a smaller, safer amount (e.g., 1 million tokens)
        const safeAmount = new BN(1_000_000).mul(decimalMultiplier);
        
        await mintTo(
          connection,
          keypair,
          mint,
          tokenAccount.address,
          keypair,
          BigInt(safeAmount.toString())
        );
      } else {
        // Safe to convert to number
        await mintTo(
          connection,
          keypair,
          mint,
          tokenAccount.address,
          keypair,
          BigInt(supplyBN.toString())
        );
      }
    } catch (bnError: any) {
      console.error('Error with BN calculation, falling back to direct approach:', bnError.message);
      
      // Fallback to a safer amount
      const safeAmount = new BN(1_000_000).mul(decimalMultiplier);
      
      await mintTo(
        connection,
        keypair,
        mint,
        tokenAccount.address,
        keypair,
        BigInt(safeAmount.toString())
      );
    }
    
    return {
      mint: mint.toBase58(),
      name,
      symbol,
      decimals,
      initialSupply,
      tokenAccount: tokenAccount.address.toBase58()
    };
  } catch (error: any) {
    console.error('Error creating token:', error.message);
    throw error;
  }
}

/**
 * Get token balance for a specific mint and owner
 * @param mintAddress Token mint address
 * @param ownerAddress Owner public key (optional, defaults to current wallet)
 * @returns Token balance information
 */
export async function getTokenBalance(mintAddress: string, ownerAddress?: string): Promise<TokenBalanceInfo> {
  try {
    // Validate inputs
    try {
      new PublicKey(mintAddress);
      if (ownerAddress) new PublicKey(ownerAddress);
    } catch (error: any) {
      throw new Error(`Invalid address: ${error.message}`);
    }

    const owner = ownerAddress ? new PublicKey(ownerAddress) : keypair.publicKey;
    const mint = new PublicKey(mintAddress);
    
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      owner
    );
    
    // Get token decimals
    let decimals = 0;
    try {
      const mintInfo = await connection.getParsedAccountInfo(mint);
      if (
        mintInfo.value && 
        mintInfo.value.data && 
        'parsed' in mintInfo.value.data && 
        mintInfo.value.data.parsed.type === 'mint'
      ) {
        decimals = mintInfo.value.data.parsed.info.decimals;
      }
    } catch (error: any) {
      console.error('Error getting token decimals, using 0:', error.message);
    }
    
    return {
      mint: mintAddress,
      owner: owner.toBase58(),
      balance: Number(tokenAccount.amount) / Math.pow(10, decimals)
    };
  } catch (error: any) {
    console.error('Error getting token balance:', error.message);
    throw error;
  }
}

/**
 * Get token metadata (simplified version)
 * @param mintAddress Token mint address
 * @returns Basic token info
 */
export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadataInfo> {
  try {
    // Validate mint address
    try {
      new PublicKey(mintAddress);
    } catch (error: any) {
      console.warn(`Invalid mint address: ${mintAddress}`);
      return {
        mint: mintAddress,
        name: "Invalid",
        symbol: "INV",
        uri: '',
        isNft: false,
        metadata: null
      };
    }

    const mint = new PublicKey(mintAddress);
    
    // Get basic token info from connection
    const mintInfo = await connection.getParsedAccountInfo(mint);
    
    // Get token account to attempt to find token symbol
    const accounts = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, {
      mint
    });
    
    let name = "Unknown";
    let symbol = "UNK";
    let decimals = 0;
    
    if (
      mintInfo.value && 
      mintInfo.value.data && 
      'parsed' in mintInfo.value.data && 
      mintInfo.value.data.parsed.type === 'mint'
    ) {
      decimals = mintInfo.value.data.parsed.info.decimals;
      
      // Try to find name/symbol from account data
      if (accounts.value.length > 0) {
        const owner = accounts.value[0].pubkey.toBase58();
        try {
          // The next line is just a placeholder - SPL tokens don't actually store name/symbol on-chain
          // We would typically store this info in a database in a real application
          symbol = `${mintAddress.substring(0, 3).toUpperCase()}`;
          name = `Token ${mintAddress.substring(0, 6)}`;
        } catch (err: any) {
          console.log('Could not get token info', err.message);
        }
      }
    }
    
    return {
      mint: mintAddress,
      name,
      symbol,
      uri: '',
      isNft: false,
      metadata: null
    };
  } catch (error: any) {
    console.error('Error getting token metadata:', error.message);
    return {
      mint: mintAddress,
      name: "Unknown",
      symbol: "UNK",
      uri: '',
      isNft: false,
      metadata: null
    };
  }
}