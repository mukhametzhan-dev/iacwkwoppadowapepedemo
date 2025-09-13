import { 
  Connection, 
  PublicKey, 
  Transaction,
  SystemProgram,
  Keypair
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import type { WalletContextState } from '@solana/wallet-adapter-react';

// IDL for the Anchor program
export const PEPELAB_PROGRAM_IDL = {
  version: "0.1.0",
  name: "pepelab_program",
  instructions: [
    {
      name: "recordLaunch",
      accounts: [
        {
          name: "record",
          isMut: true,
          isSigner: false
        },
        {
          name: "launcher",
          isMut: true,
          isSigner: true
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "mint",
          type: "publicKey"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "LaunchRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "launcher",
            type: "publicKey"
          },
          {
            name: "mint",
            type: "publicKey"
          },
          {
            name: "timestamp",
            type: "i64"
          }
        ]
      }
    }
  ]
};

export interface LaunchRecord {
  launcher: PublicKey;
  mint: PublicKey;
  timestamp: BN;
}

export interface RecordLaunchResult {
  signature: string;
  recordAddress: string;
  explorerUrl: string;
}

/**
 * Anchor client for interacting with the PepeLab program
 */
export class PepelabAnchorClient {
  private connection: Connection;
  private wallet: WalletContextState;
  private programId: PublicKey;
  private program: Program | null = null;

  constructor(connection: Connection, wallet: WalletContextState, programId: string) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = new PublicKey(programId);
  }

  /**
   * Initialize the Anchor program
   */
  private getProgram(): Program {
    if (!this.program) {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const provider = new AnchorProvider(
        this.connection,
        this.wallet as any,
        { commitment: 'confirmed' }
      );

      this.program = new Program(PEPELAB_PROGRAM_IDL as any, this.programId, provider);
    }

    return this.program;
  }

  /**
   * Record a token launch on-chain
   */
  async recordLaunch(mintAddress: string): Promise<RecordLaunchResult> {
    if (!this.wallet.publicKey || !this.wallet.signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }

    const program = this.getProgram();
    const mint = new PublicKey(mintAddress);

    // Generate a unique record account
    const recordKeypair = Keypair.generate();
    const record = recordKeypair.publicKey;

    try {
      // Build the instruction
      const instruction = await program.methods
        .recordLaunch(mint)
        .accounts({
          record: record,
          launcher: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Create transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.wallet.publicKey;

      // Partially sign with record keypair
      transaction.partialSign(recordKeypair);

      // Sign with wallet
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      return {
        signature,
        recordAddress: record.toBase58(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };

    } catch (error) {
      console.error('Failed to record launch:', error);
      throw new Error(`Failed to record launch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch a launch record by record account address
   */
  async fetchLaunchRecord(recordAddress: string): Promise<LaunchRecord | null> {
    try {
      const program = this.getProgram();
      const record = new PublicKey(recordAddress);
      
      const accountData = await program.account.launchRecord.fetch(record);
      return accountData as LaunchRecord;

    } catch (error) {
      console.error('Failed to fetch launch record:', error);
      return null;
    }
  }

  /**
   * Get all launch records for a specific launcher
   */
  async getLaunchRecordsForLauncher(launcherAddress?: string): Promise<{ address: string; data: LaunchRecord }[]> {
    try {
      const program = this.getProgram();
      const launcher = launcherAddress ? new PublicKey(launcherAddress) : this.wallet.publicKey;
      
      if (!launcher) {
        throw new Error('No launcher address provided and wallet not connected');
      }

      const records = await program.account.launchRecord.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: launcher.toBase58()
          }
        }
      ]);

      return records.map(record => ({
        address: record.publicKey.toBase58(),
        data: record.account as LaunchRecord
      }));

    } catch (error) {
      console.error('Failed to fetch launch records:', error);
      return [];
    }
  }

  /**
   * Get all launch records for a specific mint
   */
  async getLaunchRecordsForMint(mintAddress: string): Promise<{ address: string; data: LaunchRecord }[]> {
    try {
      const program = this.getProgram();
      const mint = new PublicKey(mintAddress);

      const records = await program.account.launchRecord.all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator and launcher pubkey
            bytes: mint.toBase58()
          }
        }
      ]);

      return records.map(record => ({
        address: record.publicKey.toBase58(),
        data: record.account as LaunchRecord
      }));

    } catch (error) {
      console.error('Failed to fetch launch records for mint:', error);
      return [];
    }
  }
}

/**
 * Create a new Anchor client instance
 */
export function createAnchorClient(
  connection: Connection,
  wallet: WalletContextState,
  programId?: string
): PepelabAnchorClient {
  const defaultProgramId = process.env.VITE_SOLANA_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
  return new PepelabAnchorClient(connection, wallet, programId || defaultProgramId);
}

/**
 * Utility to derive launch record address (if using PDA)
 * Currently not used since we're generating keypairs, but included for future reference
 */
export function getLaunchRecordAddress(
  programId: PublicKey,
  launcher: PublicKey,
  mint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode('launch_record'),
      launcher.toBuffer(),
      mint.toBuffer()
    ],
    programId
  );
}