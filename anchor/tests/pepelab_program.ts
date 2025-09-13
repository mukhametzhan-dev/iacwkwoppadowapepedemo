import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PepelabProgram } from "../target/types/pepelab_program";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("pepelab_program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PepelabProgram as Program<PepelabProgram>;
  const provider = anchor.getProvider();

  it("Records a token launch", async () => {
    // Generate a keypair for the launch record account
    const recordKeypair = Keypair.generate();
    
    // Create a dummy mint address for testing
    const dummyMint = Keypair.generate().publicKey;

    try {
      // Call the record_launch instruction
      const tx = await program.methods
        .recordLaunch(dummyMint)
        .accounts({
          record: recordKeypair.publicKey,
          launcher: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([recordKeypair])
        .rpc();

      console.log("Transaction signature:", tx);

      // Fetch the launch record account
      const recordAccount = await program.account.launchRecord.fetch(recordKeypair.publicKey);
      
      expect(recordAccount.launcher.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(recordAccount.mint.toString()).to.equal(dummyMint.toString());
      expect(recordAccount.timestamp).to.be.greaterThan(0);

      console.log("Launch record:", recordAccount);
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

  it("Calls create_token instruction", async () => {
    try {
      const tx = await program.methods
        .createToken("Test Token", "TEST", 9, new anchor.BN(1000000))
        .accounts({
          signer: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Create token transaction signature:", tx);
    } catch (error) {
      console.error("Create token test failed:", error);
      throw error;
    }
  });
});