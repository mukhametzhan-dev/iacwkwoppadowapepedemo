// Update the connection configuration in config.ts
import { Connection, Keypair, PublicKey, clusterApiUrl, Commitment, ConnectionConfig } from '@solana/web3.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

// Environment variables with better defaults
const CLUSTER = process.env.SOLANA_CLUSTER || 'devnet';
const DEFAULT_ENDPOINT = CLUSTER === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com';
  
// Use RPC_ENDPOINT from env, or try multiple fallback endpoints
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || DEFAULT_ENDPOINT;

// Fallback RPC endpoints in case primary fails
const FALLBACK_ENDPOINTS = {
  devnet: [
    'https://api.devnet.solana.com',
    clusterApiUrl('devnet')
  ],
  mainnet: [
    'https://api.mainnet-beta.solana.com',
    clusterApiUrl('mainnet-beta')
  ]
};


// Use the correct Commitment type from @solana/web3.js
const commitment: Commitment = 'confirmed';

// Set higher commitment level and timeout for better reliability
const connectionConfig: ConnectionConfig = {
  commitment,
  confirmTransactionInitialTimeout: 120000, // Increase timeout to 2 minutes
  disableRetryOnRateLimit: true,
  httpHeaders: {
    'Content-Type': 'application/json'
  }
};

const WALLET_PATH = process.env.WALLET_PATH || './wallet.json';

// Create connection with retries
let currentEndpointIndex = 0;
export let connection: Connection;

function createConnection() {
  console.log(`Connecting to Solana ${CLUSTER} using RPC endpoint: ${RPC_ENDPOINT}`);
  connection = new Connection(RPC_ENDPOINT, connectionConfig);
  
  // Set up automatic fallback to alternative endpoints if main one fails
  connection.getVersion().catch(error => {
    console.error(`Error connecting to ${RPC_ENDPOINT}:`, error);
    fallbackToNextEndpoint();
  });
}

// Function to try next fallback endpoint
function fallbackToNextEndpoint() {
  const endpoints = FALLBACK_ENDPOINTS[CLUSTER === 'mainnet' ? 'mainnet' : 'devnet'];
  currentEndpointIndex = (currentEndpointIndex + 1) % endpoints.length;
  const nextEndpoint = endpoints[currentEndpointIndex];
  
  // Add a delay before trying the next endpoint
  console.log(`Will try fallback RPC endpoint in 2 seconds: ${nextEndpoint}`);
  
  setTimeout(() => {
    console.log(`Trying fallback RPC endpoint: ${nextEndpoint}`);
    connection = new Connection(nextEndpoint, connectionConfig);
    
    // Verify the new connection works
    connection.getVersion().catch(error => {
      console.error(`Error connecting to fallback endpoint ${nextEndpoint}:`, error);
      // Try next endpoint if this one also fails
      fallbackToNextEndpoint();
    });
  }, 2000); // 2 second delay before trying next endpoint
}

// Initialize connection
createConnection();

// Load or create server wallet (for admin functions)
let serverKeypair: Keypair;
try {
  if (fs.existsSync(WALLET_PATH)) {
    const secretKey = new Uint8Array(JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8')));
    serverKeypair = Keypair.fromSecretKey(secretKey);
    console.log('Server wallet loaded:', serverKeypair.publicKey.toBase58());
  } else {
    serverKeypair = Keypair.generate();
    fs.writeFileSync(WALLET_PATH, JSON.stringify(Array.from(serverKeypair.secretKey)));
    console.log('New server wallet generated:', serverKeypair.publicKey.toBase58());
  }
} catch (error) {
  console.error('Error loading server wallet:', error);
  serverKeypair = Keypair.generate();
}

// This is used for backward compatibility with existing code
export const keypair = serverKeypair;

// Function to request airdrop with retry logic
export async function requestAirdrop(publicKey: string, amount: number = 1): Promise<string> {
  try {
    console.log(`Requesting ${amount} SOL airdrop for ${publicKey}`);
    const pubkey = new PublicKey(publicKey);
    
    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const signature = await connection.requestAirdrop(pubkey, amount * 1e9); // Convert SOL to lamports
        console.log(`Airdrop requested, signature: ${signature}`);
        
        // Wait for confirmation with timeout
        await Promise.race([
          connection.confirmTransaction(signature),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Confirmation timeout')), 30000))
        ]);
        
        console.log(`Airdrop confirmed for ${publicKey}`);
        return signature;
      } catch (error) {
        console.error(`Airdrop attempt ${attempt} failed:`, error);
        
        if (attempt < 3) {
          console.log(`Retrying airdrop in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try with a different RPC endpoint
          fallbackToNextEndpoint();
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('All airdrop attempts failed');
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
}

export { serverKeypair, CLUSTER };
