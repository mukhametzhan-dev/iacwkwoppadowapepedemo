/**
 * Dev Script: Create Token on Solana Devnet
 * 
 * This script creates SPL tokens on devnet using a local keypair.
 * It should ONLY be used for development and testing purposes.
 * 
 * SECURITY WARNING:
 * - Never commit keypair files to version control
 * - Only use on devnet, never on mainnet
 * - Store keypairs securely and never share them
 * 
 * Usage:
 * node dev-scripts/create-token-devnet.js <keypair-path> <recipient-pubkey> <name> <symbol> <supply> [decimals]
 * 
 * Example:
 * node dev-scripts/create-token-devnet.js ~/.config/solana/devnet-keypair.json 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU "PepeLab Token" "PEPE" 1000000 6
 */

const {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} = require('@solana/web3.js');

const {
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
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Devnet RPC endpoint
const DEVNET_RPC = 'https://api.devnet.solana.com';

/**
 * Load keypair from file path
 */
function loadKeypair(keypairPath) {
  try {
    const keypairFile = fs.readFileSync(path.resolve(keypairPath), 'utf8');
    const keypairData = JSON.parse(keypairFile);
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error('❌ Failed to load keypair:', error.message);
    console.log('\n💡 To generate a devnet keypair:');
    console.log('   solana-keygen new --outfile ~/.config/solana/devnet-keypair.json');
    console.log('   solana airdrop 2 --keypair ~/.config/solana/devnet-keypair.json --url devnet');
    process.exit(1);
  }
}

/**
 * Validate command line arguments
 */
function validateArgs(args) {
  if (args.length < 6) {
    console.log('❌ Usage: node create-token-devnet.js <keypair-path> <recipient-pubkey> <name> <symbol> <supply> [decimals]');
    console.log('\nExample:');
    console.log('   node create-token-devnet.js ~/.config/solana/devnet-keypair.json 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU "PepeLab Token" "PEPE" 1000000 6');
    process.exit(1);
  }

  const [, , keypairPath, recipientPubkey, name, symbol, supply, decimals = '6'] = args;

  // Validate recipient public key
  try {
    new PublicKey(recipientPubkey);
  } catch (error) {
    console.error('❌ Invalid recipient public key:', recipientPubkey);
    process.exit(1);
  }

  // Validate supply
  const supplyNum = parseInt(supply);
  if (isNaN(supplyNum) || supplyNum <= 0) {
    console.error('❌ Invalid supply. Must be a positive number:', supply);
    process.exit(1);
  }

  // Validate decimals
  const decimalsNum = parseInt(decimals);
  if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
    console.error('❌ Invalid decimals. Must be between 0 and 9:', decimals);
    process.exit(1);
  }

  return {
    keypairPath,
    recipientPubkey: new PublicKey(recipientPubkey),
    name,
    symbol: symbol.toUpperCase(),
    supply: supplyNum,
    decimals: decimalsNum
  };
}

/**
 * Create SPL token and mint to recipient
 */
async function createToken(connection, payer, recipient, name, symbol, supply, decimals) {
  console.log('🚀 Creating SPL token on Solana devnet...');
  console.log('📋 Token Details:');
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Supply: ${supply.toLocaleString()}`);
  console.log(`   Decimals: ${decimals}`);
  console.log(`   Recipient: ${recipient.toBase58()}`);
  console.log('');

  try {
    // Create mint
    console.log('⚙️  Creating mint...');
    const mint = await createMint(
      connection,
      payer,           // payer
      payer.publicKey, // mint authority
      payer.publicKey, // freeze authority
      decimals         // decimals
    );

    console.log(`✅ Mint created: ${mint.toBase58()}`);
    console.log(`🔗 Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);
    console.log('');

    // Get or create associated token account for recipient
    console.log('⚙️  Creating associated token account...');
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,     // payer
      mint,      // mint
      recipient  // owner
    );

    console.log(`✅ Token account: ${tokenAccount.address.toBase58()}`);
    console.log('');

    // Mint tokens to recipient
    console.log('⚙️  Minting tokens...');
    const mintSignature = await mintTo(
      connection,
      payer,                    // payer
      mint,                     // mint
      tokenAccount.address,     // destination
      payer.publicKey,         // authority
      supply * Math.pow(10, decimals)  // amount (with decimals)
    );

    console.log(`✅ Tokens minted: ${supply.toLocaleString()} ${symbol}`);
    console.log(`📝 Transaction: ${mintSignature}`);
    console.log(`🔗 Explorer: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`);
    console.log('');

    // Return results
    return {
      mintAddress: mint.toBase58(),
      tokenAccount: tokenAccount.address.toBase58(),
      mintSignature,
      name,
      symbol,
      supply,
      decimals
    };

  } catch (error) {
    console.error('❌ Token creation failed:', error.message);
    
    // Check common issues
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Insufficient SOL for transaction fees.');
      console.log('   Get devnet SOL: solana airdrop 2 --keypair <your-keypair> --url devnet');
    }
    
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔧 PepeLab Token Creation Script (Devnet Only)');
  console.log('=============================================');
  console.log('');

  // Parse and validate arguments
  const args = validateArgs(process.argv);
  
  // Load keypair
  console.log('🔑 Loading keypair...');
  const payer = loadKeypair(args.keypairPath);
  console.log(`✅ Loaded keypair: ${payer.publicKey.toBase58()}`);
  console.log('');

  // Connect to devnet
  console.log('🌐 Connecting to Solana devnet...');
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const solBalance = balance / 1e9;
  console.log(`💰 Payer balance: ${solBalance.toFixed(4)} SOL`);
  
  if (solBalance < 0.01) {
    console.log('⚠️  Low SOL balance. You may need more SOL for transaction fees.');
    console.log('   Get devnet SOL: solana airdrop 2 --url devnet');
  }
  console.log('');

  // Create token
  const result = await createToken(
    connection,
    payer,
    args.recipientPubkey,
    args.name,
    args.symbol,
    args.supply,
    args.decimals
  );

  // Print final summary
  console.log('🎉 Token Creation Successful!');
  console.log('============================');
  console.log(`📛 Name: ${result.name}`);
  console.log(`🏷️  Symbol: ${result.symbol}`);
  console.log(`🪙 Mint: ${result.mintAddress}`);
  console.log(`👛 Token Account: ${result.tokenAccount}`);
  console.log(`💳 Supply: ${result.supply.toLocaleString()} tokens`);
  console.log(`📝 Tx Signature: ${result.mintSignature}`);
  console.log('');
  console.log('🔗 Explorer Links:');
  console.log(`   Mint: https://explorer.solana.com/address/${result.mintAddress}?cluster=devnet`);
  console.log(`   Transaction: https://explorer.solana.com/tx/${result.mintSignature}?cluster=devnet`);
  console.log('');
  console.log('⚠️  Remember: This token was created on DEVNET only!');
  console.log('');

  // Output for easy copying (JSON format)
  console.log('📋 JSON Output (for scripts):');
  console.log(JSON.stringify(result, null, 2));
}

// Handle errors gracefully
main().catch((error) => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});