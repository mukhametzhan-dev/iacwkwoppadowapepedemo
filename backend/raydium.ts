import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { 
  Raydium, TxVersion, TokenAmount, toToken, Percent,
  ApiV3PoolInfoStandardItem, ApiV3PoolInfoStandardItemCpmm, CpmmKeys,
  FEE_DESTINATION_ID, DEVNET_PROGRAM_ID, LOCK_CPMM_PROGRAM, LOCK_CPMM_AUTH,
  CREATE_CPMM_POOL_PROGRAM, CREATE_CPMM_POOL_FEE_ACC, getCpmmPdaAmmConfigId,
  CurveCalculator, CpmmRpcData
} from '@raydium-io/raydium-sdk-v2';
import { connection, keypair, CLUSTER } from './config';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenInfo, getTokenBalance } from './token';
import fs from 'fs';
import path from 'path';
import { Keypair } from '@solana/web3.js';

// Database file path for storing local pool data
const DATA_DIR = path.join(__dirname, '../data');
const POOLS_FILE = path.join(DATA_DIR, 'pools.json');

// Ensure data directory exists
function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`Creating data directory: ${DATA_DIR}`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  // Create empty pools file if it doesn't exist
  if (!fs.existsSync(POOLS_FILE)) {
    console.log(`Creating empty pools file: ${POOLS_FILE}`);
    fs.writeFileSync(POOLS_FILE, JSON.stringify([], null, 2));
  }
}

// Initialize Raydium SDK
async function initSdk() {
  return await Raydium.load({
    connection,
    owner: keypair,
    cluster: CLUSTER === 'mainnet' ? 'mainnet' : 'devnet'
  });
}

// Helper function to check if a file exists and is not empty
function fileExistsWithData(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch (error) {
    return false;
  }
}

// Improved function to read pools data with better error handling
export function readPoolsData(): any[] {
  ensureDataDirExists();
  
  try {
    if (!fs.existsSync(POOLS_FILE)) {
      console.log(`Pools file doesn't exist, returning empty array`);
      return [];
    }
    
    const data = fs.readFileSync(POOLS_FILE, 'utf-8');
    
    // Handle empty file
    if (!data || data.trim() === '') {
      console.log(`Pools file is empty, returning empty array`);
      return [];
    }
    
    try {
      const parsed = JSON.parse(data);
      
      if (!Array.isArray(parsed)) {
        console.warn(`Pools data is not an array, resetting to empty array`);
        fs.writeFileSync(POOLS_FILE, JSON.stringify([], null, 2));
        return [];
      }
      
      return parsed;
    } catch (parseError) {
      console.error(`Error parsing pools data, resetting file:`, parseError);
      fs.writeFileSync(POOLS_FILE, JSON.stringify([], null, 2));
      return [];
    }
  } catch (error) {
    console.error('Error reading pools data:', error);
    return [];
  }
}

// Improved function to write pools data with backup
export function writePoolsData(pools: any[]): void {
  ensureDataDirExists();
  
  try {
    // Validate pools is an array
    if (!Array.isArray(pools)) {
      console.error('Invalid pools data (not an array)');
      return;
    }
    
    // Create a backup of the current file if it exists
    if (fs.existsSync(POOLS_FILE)) {
      const backupPath = `${POOLS_FILE}.backup`;
      fs.copyFileSync(POOLS_FILE, backupPath);
    }
    
    // Write the new data
    fs.writeFileSync(POOLS_FILE, JSON.stringify(pools, null, 2));
    console.log(`Successfully wrote ${pools.length} pools to ${POOLS_FILE}`);
  } catch (error) {
    console.error('Error writing pools data:', error);
  }
}

// Helper to check if CPMM pool program ID is valid
function isValidCpmm(programId: string): boolean {
  // Check if it's a valid CPMM program
  return [
    CREATE_CPMM_POOL_PROGRAM.toString(),
    DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM.toString()
  ].includes(programId);
}

// Create a CPMM pool directly
export async function createPool(baseMint: string, quoteMint: string, baseAmount: number, quoteAmount: number) {
  try {
    console.log(`Creating CPMM pool for ${baseMint} / ${quoteMint}`);
    console.log(`Base amount: ${baseAmount}, Quote amount: ${quoteAmount}`);
    
    const raydium = await initSdk();
    
    // Get token info
    const baseMintInfo = await raydium.token.getTokenInfo(baseMint);
    const quoteMintInfo = await raydium.token.getTokenInfo(quoteMint);
    
    if (!baseMintInfo || !quoteMintInfo) {
      throw new Error(`Failed to get token information for ${baseMint} or ${quoteMint}`);
    }
    
    console.log(`Base token: ${baseMintInfo.symbol || 'Unknown'} (${baseMintInfo.decimals} decimals)`);
    console.log(`Quote token: ${quoteMintInfo.symbol || 'Unknown'} (${quoteMintInfo.decimals} decimals)`);
    
    // Convert amounts to BN safely
    const baseAmountRaw = baseAmount * Math.pow(10, baseMintInfo.decimals);
    const quoteAmountRaw = quoteAmount * Math.pow(10, quoteMintInfo.decimals);
    
    // Ensure we're using integer values for BN
    const baseAmountBN = new BN(Math.floor(baseAmountRaw).toString());
    const quoteAmountBN = new BN(Math.floor(quoteAmountRaw).toString());
    
    console.log(`Base amount in raw units: ${baseAmountBN.toString()}`);
    console.log(`Quote amount in raw units: ${quoteAmountBN.toString()}`);
    
    // Check balances to ensure we have enough tokens
    try {
      // Skip balance check for SOL (native token)
      if (baseMint !== 'So11111111111111111111111111111111111111112') {
        const baseBalance = await getTokenBalance(baseMint, keypair.publicKey.toBase58());
        if (baseBalance.balance < baseAmount) {
          throw new Error(`Insufficient ${baseMintInfo.symbol || 'base token'} balance. Have: ${baseBalance.balance}, Need: ${baseAmount}`);
        }
      } else {
        const solBalance = await connection.getBalance(keypair.publicKey);
        if (solBalance < baseAmountRaw + 10000000) { // Add some for transaction fees
          throw new Error(`Insufficient SOL balance. Have: ${solBalance/1e9}, Need: ${baseAmount + 0.01}`);
        }
      }
      
      // Skip balance check for SOL (native token)
      if (quoteMint !== 'So11111111111111111111111111111111111111112') {
        const quoteBalance = await getTokenBalance(quoteMint, keypair.publicKey.toBase58());
        if (quoteBalance.balance < quoteAmount) {
          throw new Error(`Insufficient ${quoteMintInfo.symbol || 'quote token'} balance. Have: ${quoteBalance.balance}, Need: ${quoteAmount}`);
        }
      } else {
        const solBalance = await connection.getBalance(keypair.publicKey);
        if (solBalance < quoteAmountRaw + 10000000) { // Add some for transaction fees
          throw new Error(`Insufficient SOL balance. Have: ${solBalance/1e9}, Need: ${quoteAmount + 0.01}`);
        }
      }
    } catch (balanceError) {
      console.error('Balance check failed:', balanceError);
      throw balanceError;
    }
    
    // Get fee configs
    const feeConfigs = await raydium.api.getCpmmConfigs();
if (CLUSTER === 'devnet') {
  feeConfigs.forEach((config) => {
    config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58();
  });
}
// Use feeConfigs[0] in the createPool call

    
    // Use correct program IDs based on environment
    const programId = CLUSTER === 'devnet' 
      ? DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM 
      : CREATE_CPMM_POOL_PROGRAM;
    
    const poolFeeAccount = CLUSTER === 'devnet'
      ? DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
      : CREATE_CPMM_POOL_FEE_ACC;
    
    console.log(`Using pool program ID: ${programId.toString()}`);
    console.log(`Using pool fee account: ${poolFeeAccount.toString()}`);
    console.log('Executing CPMM pool creation...');
    
    // Create CPMM pool with exact parameter structure
    const { execute, extInfo } = await raydium.cpmm.createPool({
      // Let Raydium generate the poolId
      poolId: undefined,
      programId,
      poolFeeAccount,
      mintA: {
        address: baseMint,
        decimals: baseMintInfo.decimals,
        programId: TOKEN_PROGRAM_ID.toBase58(),
      },
      mintB: {
        address: quoteMint,
        decimals: quoteMintInfo.decimals,
        programId: TOKEN_PROGRAM_ID.toBase58(),
      },
      mintAAmount: baseAmountBN,
      mintBAmount: quoteAmountBN,
      startTime: new BN(0),
      feeConfig: feeConfigs[0],  // Use the first fee config
      associatedOnly: false,
      checkCreateATAOwner: false,
      ownerInfo: {
        feePayer: keypair.publicKey,
        useSOLBalance: true,
      },
      txVersion: TxVersion.LEGACY,
    });
    
    console.log('Pool creation transaction prepared, executing...');
    
    // Execute transaction with the server keypair
    const { txId } = await execute({ 
      sendAndConfirm: true
    });
    
    console.log(`Pool creation transaction confirmed: ${txId}`);
    
    // Get pool ID from execution info
    const poolId = extInfo.address.poolId.toBase58();
    console.log(`New pool created with ID: ${poolId}`);
    
    // Get additional token info for better UI display
    const poolData = {
      poolId: poolId,
      txId,
      type: "CPMM",
      baseMint: baseMint,
      baseName: baseMintInfo.name || 'Unknown',
      baseSymbol: baseMintInfo.symbol || 'UNK',
      baseDecimals: baseMintInfo.decimals,
      baseAmount: baseAmount,
      quoteMint: quoteMint,
      quoteName: quoteMintInfo.name || 'Unknown',
      quoteSymbol: quoteMintInfo.symbol || 'UNK',
      quoteDecimals: quoteMintInfo.decimals,
      quoteAmount: quoteAmount,
      lpMint: extInfo.address.lpMint.toBase58(),
      programId: extInfo.address.programId.toBase58(),
      createdAt: new Date().toISOString(),
      owner: keypair.publicKey.toBase58(),
      initialPrice: quoteAmount / baseAmount,
    };

    // Save pool data to local file database
    const pools = readPoolsData();
    pools.push(poolData);
    writePoolsData(pools);
    
    console.log('Pool data saved to local database');
    
    return poolData;
  } catch (error) {
    console.error('Error creating CPMM pool:', error);
    
    // Create a placeholder pool as fallback
    try {
      console.log('Creating placeholder pool as fallback...');
      const placeholderPool = await createPlaceholderPool({
        mint: baseMint,
        name: "Unknown",
        symbol: "UNK",
        decimals: 9,
        initialSupply: 0,
        tokenAccount: ""
      });
      return placeholderPool;
    } catch (placeholderError) {
      console.error('Error creating placeholder pool:', placeholderError);
      throw error;
    }
  }
}

// Create a token with CPMM pool
export async function createTokenWithPool(tokenInfo: TokenInfo, initialSolAmount: number): Promise<any> {
  try {
    console.log(`Creating CPMM pool for token ${tokenInfo.name} (${tokenInfo.symbol}) with ${initialSolAmount} SOL`);
    
    // Native SOL mint
    const solMint = 'So11111111111111111111111111111111111111112';
    
    // Calculate token amount based on desired price
    // Default to 10% of token supply 
    const tokenPoolAmount = tokenInfo.initialSupply * 0.1;
    console.log(`Using ${tokenPoolAmount} ${tokenInfo.symbol} tokens for the pool`);
    
    try {
      // Ensure we have the token in our balance
      const tokenBalance = await getTokenBalance(tokenInfo.mint, keypair.publicKey.toBase58());
      
      if (tokenBalance.balance < tokenPoolAmount) {
        console.error(`Not enough token balance. Have: ${tokenBalance.balance}, Need: ${tokenPoolAmount}`);
        throw new Error(`Insufficient ${tokenInfo.symbol} token balance for pool creation`);
      }
      
      try {
        // Create the CPMM pool directly
        const pool = await createPool(
          tokenInfo.mint,
          solMint,
          tokenPoolAmount,
          initialSolAmount
        );
        
        // Calculate and display initial price
        const initialPrice = initialSolAmount / tokenPoolAmount;
        console.log(`Initial token price: ${initialPrice} SOL per ${tokenInfo.symbol}`);
        
        return {
          ...tokenInfo,
          pool,
          initialPrice
        };
      } catch (poolError) {
        console.error('Pool creation failed:', poolError);
        
        // Create a placeholder pool and return the token info
        console.log('Creating placeholder pool as fallback...');
        
        const placeholderPool = await createPlaceholderPool(tokenInfo);
        
        return {
          ...tokenInfo,
          pool: placeholderPool,
          error: 'Pool creation encountered an error. A placeholder pool was created.',
          errorDetails: poolError instanceof Error ? poolError.message : String(poolError)
        };
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      return {
        ...tokenInfo,
        pool: null,
        error: 'Pool creation failed. You can try creating it manually.',
        errorDetails: error instanceof Error ? error.message : String(error)
      };
    }
  } catch (error) {
    console.error('Error creating token with pool:', error);
    throw error;
  }
}

// Add liquidity to CPMM pool
export async function addLiquidity(poolId: string, amountA: number, fixedSide: 'a' | 'b', slippage: number) {
  try {
    console.log(`Adding liquidity to CPMM pool ${poolId}`);
    const raydium = await initSdk();
    
    // Get pool info
    let poolInfo: ApiV3PoolInfoStandardItemCpmm;
    let poolKeys: CpmmKeys | undefined;
    
    try {
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      poolInfo = data.poolInfo;
      poolKeys = data.poolKeys;
    } catch (error) {
      console.error('Error fetching CPMM pool info, checking local data:', error);
      
      // Check local database for the pool
      const pools = readPoolsData();
      const localPool = pools.find(p => p.poolId === poolId);
      if (!localPool) {
        throw new Error('Pool not found in local database');
      }
      
      throw new Error('Could not get pool info from RPC and local data is insufficient for this operation');
    }
    
    // Calculate amounts
    const slippagePercent = new Percent(slippage * 100, 10000);
    
    // Input amount in tokens with proper decimal places
    const inputAmount = new BN(
      new Decimal(amountA)
        .mul(10 ** (fixedSide === 'a' ? poolInfo.mintA.decimals : poolInfo.mintB.decimals))
        .toFixed(0, Decimal.ROUND_DOWN)
    );
    
    // Execute add liquidity transaction
    const { execute } = await raydium.cpmm.addLiquidity({
      poolInfo,
      poolKeys,
      inputAmount,
      baseIn: fixedSide === 'a',
      slippage: slippagePercent,
      txVersion: TxVersion.LEGACY,
    });
    
    const { txId } = await execute({ sendAndConfirm: true });
    
    return {
      txId,
      poolId,
      tokenA: {
        mint: poolInfo.mintA.address,
        name: poolInfo.mintA.name || 'Unknown',
        symbol: poolInfo.mintA.symbol || 'UNK',
        amount: fixedSide === 'a' ? amountA : 0 // Actual amount will be calculated by the pool
      },
      tokenB: {
        mint: poolInfo.mintB.address,
        name: poolInfo.mintB.name || 'Unknown',
        symbol: poolInfo.mintB.symbol || 'UNK',
        amount: fixedSide === 'b' ? amountA : 0 // Actual amount will be calculated by the pool
      }
    };
  } catch (error) {
    console.error('Error adding liquidity to CPMM pool:', error);
    throw error;
  }
}

// Remove liquidity from CPMM pool
export async function removeLiquidity(poolId: string, lpAmount: number, slippage: number) {
  try {
    console.log(`Removing liquidity from CPMM pool ${poolId}`);
    const raydium = await initSdk();
    
    // Get pool info using CPMM
    let poolInfo: ApiV3PoolInfoStandardItemCpmm;
    let poolKeys: CpmmKeys;
    
    try {
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      poolInfo = data.poolInfo;
      poolKeys = data.poolKeys;
    } catch (error) {
      console.error('Error fetching CPMM pool info:', error);
      throw new Error('Could not get pool info from RPC');
    }
    
    // Convert LP amount to smallest units
    const lpAmountBN = new BN(
      new Decimal(lpAmount)
        .mul(10 ** poolInfo.lpMint.decimals)
        .toFixed(0, Decimal.ROUND_DOWN)
    );
    
    // Set slippage
    const slippagePercent = new Percent(slippage * 100, 10000);
    
    // Execute withdraw transaction
    const { execute } = await raydium.cpmm.withdrawLiquidity({
      poolInfo,
      poolKeys,
      lpAmount: lpAmountBN,
      slippage: slippagePercent,
      txVersion: TxVersion.LEGACY,
    });
    
    const { txId } = await execute({ sendAndConfirm: true });
    
    return {
      txId,
      poolId,
      lpAmount,
      tokenA: {
        mint: poolInfo.mintA.address,
        name: poolInfo.mintA.name || 'Unknown',
        symbol: poolInfo.mintA.symbol || 'UNK',
      },
      tokenB: {
        mint: poolInfo.mintB.address,
        name: poolInfo.mintB.name || 'Unknown',
        symbol: poolInfo.mintB.symbol || 'UNK',
      }
    };
  } catch (error) {
    console.error('Error removing liquidity from CPMM pool:', error);
    throw error;
  }
}

// Swap using CPMM
export async function swap(poolId: string, inputMint: string, amount: number, fixedSide: 'in' | 'out', slippage: number) {
  try {
    console.log(`Swapping on CPMM pool ${poolId}`);
    const raydium = await initSdk();
    
    // Get pool info using CPMM
    let poolInfo: ApiV3PoolInfoStandardItemCpmm;
    let poolKeys: CpmmKeys;
    let rpcData: CpmmRpcData;
    
    try {
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      poolInfo = data.poolInfo;
      poolKeys = data.poolKeys;
      rpcData = data.rpcData;
    } catch (error) {
      console.error('Error fetching CPMM pool info:', error);
      throw new Error('Could not get pool info from RPC');
    }
    
    // Check if input mint matches pool
    if (poolInfo.mintA.address !== inputMint && poolInfo.mintB.address !== inputMint) {
      throw new Error('Input mint does not match pool');
    }
    
    const baseIn = inputMint === poolInfo.mintA.address;
    const [mintIn, mintOut] = baseIn
      ? [poolInfo.mintA, poolInfo.mintB]
      : [poolInfo.mintB, poolInfo.mintA];
    
    // Convert amount to smallest units
    const amountBN = new BN(
      new Decimal(amount)
        .mul(10 ** mintIn.decimals)
        .toFixed(0, Decimal.ROUND_DOWN)
    );
    
    // Calculate swap using CurveCalculator
    const swapResult = CurveCalculator.swap(
      amountBN,
      baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
      baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
      rpcData.configInfo!.tradeFeeRate
    );
    
    // Execute swap
    const { execute } = await raydium.cpmm.swap({
      poolInfo,
      poolKeys,
      baseIn,
      fixedOut: fixedSide === 'out',
      inputAmount: amountBN,
      swapResult,
      slippage: slippage / 100,
      txVersion: TxVersion.LEGACY,
    });
    
    const { txId } = await execute({ sendAndConfirm: true });
    
    return {
      txId,
      poolId,
      inputToken: {
        mint: mintIn.address,
        name: mintIn.name || 'Unknown',
        symbol: mintIn.symbol || 'UNK',
        amount: amount
      },
      outputToken: {
        mint: mintOut.address,
        name: mintOut.name || 'Unknown',
        symbol: mintOut.symbol || 'UNK',
        amount: new Decimal(swapResult.destinationAmountSwapped.toString()).div(10 ** mintOut.decimals).toNumber(),
      }
    };
  } catch (error) {
    console.error('Error swapping on CPMM pool:', error);
    throw error;
  }
}

// Get pool info with validation
export async function getPoolInfo(poolId: string) {
  try {
    // Validate poolId is a valid base58 string
    if (!poolId || poolId === 'list' || poolId === 'token' || poolId.trim() === '' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(poolId)) {
      console.log(`Invalid pool ID format or reserved word: ${poolId}`);
      return null; // Return null for invalid pool IDs
    }
    
    const raydium = await initSdk();
    
    // Get CPMM pool info
    try {
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      return {
        ...data.poolInfo,
        poolKeys: data.poolKeys,
        type: "CPMM",
        lpBalance: await getLpBalance(poolId, keypair.publicKey.toBase58())
      };
    } catch (cpmmError) {
      console.error('Error getting CPMM pool info, checking local database:', cpmmError);
      
      // Check local database for the pool
      const pools = readPoolsData();
      const localPool = pools.find(p => p.poolId === poolId);
      if (localPool) {
        return {
          ...localPool,
          lpBalance: await getLpBalance(poolId, keypair.publicKey.toBase58())
        };
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error getting pool info:', error);
    return null;
  }
}

// Get pools by token mint address
export async function getPoolsByToken(mintAddress: string): Promise<any[]> {
  try {
    console.log(`Fetching pools for token ${mintAddress}`);
    
    // For mainnet, we can use the Raydium API
    if (CLUSTER === 'mainnet') {
      const raydium = await initSdk();
      try {
        // Use the correct API method
        const pools = await raydium.api.fetchPoolByMints({
          mint1: mintAddress
        });
        
        // Make sure we return an array, even if the API returns something else
        return Array.isArray(pools) ? pools : [];
      } catch (e) {
        console.error('Error fetching from Raydium API:', e);
        // Fall back to local pool data if API fails
      }
    }
    
    // For devnet or as a fallback, use our local pool data
    const pools = readPoolsData();
    const filteredPools = pools.filter(pool => 
      pool.baseMint === mintAddress || pool.quoteMint === mintAddress
    );
    
    console.log(`Found ${filteredPools.length} pools locally for token ${mintAddress}`);
    return filteredPools;
  } catch (error) {
    console.error('Error getting pools for token:', error);
    return [];
  }
}

// Get all pools created by the user
let poolsCache: any = {
  data: null,
  timestamp: 0
};

export async function getUserPools(): Promise<any[]> {
  try {
    const userWallet = keypair.publicKey.toBase58();
    
    // Check if we have cached data less than 5 seconds old
    const now = Date.now();
    if (poolsCache.data && now - poolsCache.timestamp < 5000) {
      console.log('Returning cached pools data');
      return poolsCache.data;
    }
    
    const pools = readPoolsData();
    
    // Filter pools by owner
    const userPools = pools.filter(pool => pool.owner === userWallet);
    console.log(`Found ${userPools.length} pools created by ${userWallet}`);
    
    // Update cache
    poolsCache = {
      data: userPools,
      timestamp: now
    };
    
    return userPools;
  } catch (error) {
    console.error('Error getting user pools:', error);
    // Return cached data if available, even if it's older
    if (poolsCache.data) {
      console.log('Returning cached pools data after error');
      return poolsCache.data;
    }
    return [];
  }
}

// Utility to get LP token balance for a user
async function getLpBalance(poolId: string, ownerAddress: string) {
  try {
    // Skip for invalid pool IDs
    if (!poolId || poolId === 'list' || poolId === 'token' || poolId.trim() === '' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(poolId)) {
      return { lpMint: '', balance: 0 };
    }
    
    const raydium = await initSdk();
    
    let lpMint: string;
    
    // Try to get LP mint from CPMM pool
    try {
      const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      lpMint = data.poolInfo.lpMint.address;
    } catch (cpmmError) {
      console.error('Error getting LP mint from CPMM, checking local data:', cpmmError);
      
      // Check local pools data
      const pools = readPoolsData();
      const pool = pools.find(p => p.poolId === poolId);
      if (pool && pool.lpMint) {
        lpMint = pool.lpMint;
      } else {
        return { lpMint: '', balance: 0 };
      }
    }
    
    // Find associated token account
    try {
      const owner = new PublicKey(ownerAddress);
      const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID
      });
      
      // Find LP token account
      const lpAccount = accounts.value.find(
        account => account.account.data.parsed.info.mint === lpMint
      );
      
      if (!lpAccount) {
        return {
          lpMint,
          balance: 0
        };
      }
      
      return {
        lpMint,
        balance: parseFloat(lpAccount.account.data.parsed.info.tokenAmount.uiAmount)
      };
    } catch (error) {
      console.error('Error getting token accounts:', error);
      return { lpMint: lpMint || '', balance: 0 };
    }
  } catch (error) {
    console.error('Error getting LP balance:', error);
    return { lpMint: '', balance: 0 };
  }
}

// Get user's token balances
export async function getUserTokens(ownerAddress: string) {
  try {
    const owner = new PublicKey(ownerAddress);
    const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID
    });
    
    // Filter out tokens with zero balance
    return accounts.value
      .filter(account => {
        const tokenAmount = account.account.data.parsed.info.tokenAmount;
        return parseFloat(tokenAmount.uiAmount) > 0;
      })
      .map(account => {
        const { mint, tokenAmount } = account.account.data.parsed.info;
        return {
          mint,
          balance: parseFloat(tokenAmount.uiAmount),
          decimals: tokenAmount.decimals
        };
      });
  } catch (error) {
    console.error('Error getting user tokens:', error);
    return [];
  }
}

// Create a placeholder pool for tokens without actual pools
export async function createPlaceholderPool(tokenInfo: TokenInfo) {
  try {
    ensureDataDirExists();
    
    const solMint = 'So11111111111111111111111111111111111111112';
    
    const placeholderPool = {
      poolId: `placeholder-${tokenInfo.mint.slice(0, 8)}`,
      txId: '',
      type: "CPMM",
      baseMint: tokenInfo.mint,
      baseName: tokenInfo.name || 'Unknown',
      baseSymbol: tokenInfo.symbol || 'UNK',
      baseDecimals: tokenInfo.decimals,
      baseAmount: 0,
      quoteMint: solMint,
      quoteName: 'Solana',
      quoteSymbol: 'SOL',
      quoteDecimals: 9,
      quoteAmount: 0,
      lpMint: `placeholder-lp-${tokenInfo.mint.slice(0, 6)}`,
      createdAt: new Date().toISOString(),
      owner: keypair.publicKey.toBase58(),
      initialPrice: 0,
      isPlaceholder: true
    };
    
    // Add to local database
    const pools = readPoolsData();
    
    // Check if a placeholder already exists for this token
    const existingPlaceholder = pools.find(p => 
      p.baseMint === tokenInfo.mint && (p.isPlaceholder || p.poolId.startsWith('placeholder-'))
    );
    
    if (!existingPlaceholder) {
      pools.push(placeholderPool);
      writePoolsData(pools);
      console.log(`Created placeholder pool for token ${tokenInfo.symbol}`);
    } else {
      console.log(`Using existing placeholder pool for token ${tokenInfo.symbol}`);
    }
    
    return existingPlaceholder || placeholderPool;
  } catch (error) {
    console.error('Error creating placeholder pool:', error);
    throw error;
  }
}