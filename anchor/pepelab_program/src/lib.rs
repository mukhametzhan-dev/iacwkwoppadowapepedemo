use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");


#[program]
pub mod pepelab_program {
    use super::*;
    
    /// Records a token launch on-chain with launcher and timestamp
    pub fn record_launch(ctx: Context<RecordLaunch>, mint: Pubkey) -> Result<()> {
        let record = &mut ctx.accounts.record;
        
        // Set the launch record data
        record.launcher = *ctx.accounts.launcher.key;
        record.mint = mint;
        record.timestamp = Clock::get()?.unix_timestamp;
        
        // Emit an event for indexing
        emit!(TokenLaunched {
            launcher: record.launcher,
            mint: record.mint,
            timestamp: record.timestamp,
        });
        
        msg!("Token launch recorded: mint={}, launcher={}, timestamp={}", 
             mint, record.launcher, record.timestamp);
        
        Ok(())
    }
    
    /// Optional: Create token instruction (currently a no-op placeholder)
    /// In a full implementation, this could wrap SPL token creation
    pub fn create_token(
        _ctx: Context<CreateToken>, 
        _name: String, 
        _symbol: String, 
        _decimals: u8,
        _supply: u64
    ) -> Result<()> {
        // This is a placeholder instruction
        // Token creation is handled by SPL Token program directly
        // This instruction exists to demonstrate Anchor program capabilities
        
        msg!("Create token instruction called - actual token creation handled by SPL Token program");
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RecordLaunch<'info> {
    /// Launch record account - stores the launch data
    #[account(
        init, 
        payer = launcher, 
        space = 8 + LaunchRecord::SIZE
    )]
    pub record: Account<'info, LaunchRecord>,
    
    /// The wallet launching the token (payer for record account)
    #[account(mut)]
    pub launcher: Signer<'info>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    /// The wallet creating the token
    #[account(mut)]
    pub creator: Signer<'info>,
}

#[account]
pub struct LaunchRecord {
    /// The wallet that launched the token
    pub launcher: Pubkey,
    /// The mint address of the launched token
    pub mint: Pubkey,
    /// Unix timestamp when the token was launched
    pub timestamp: i64,
}

impl LaunchRecord {
    pub const SIZE: usize = 32 + 32 + 8; // launcher + mint + timestamp
}

#[event]
pub struct TokenLaunched {
    /// The wallet that launched the token
    pub launcher: Pubkey,
    /// The mint address of the launched token
    pub mint: Pubkey,
    /// Unix timestamp when the token was launched
    pub timestamp: i64,
}

#[error_code]
pub enum PepelabError {
    #[msg("Invalid mint address provided")]
    InvalidMint,
    #[msg("Invalid launcher address")]
    InvalidLauncher,
    #[msg("Timestamp error")]
    TimestampError,
}