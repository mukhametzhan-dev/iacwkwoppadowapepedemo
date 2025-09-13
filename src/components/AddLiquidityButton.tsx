import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Droplets, Info, Copy, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AddLiquidityButtonProps {
  mintAddress: string;
  tokenSymbol: string;
  disabled?: boolean;
  className?: string;
}

// Devnet token addresses for common pairs
const DEVNET_TOKENS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Note: This is mainnet USDC, devnet may vary
  WSOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  // For devnet testing, we'll use these addresses - they may need to be updated
};

export const AddLiquidityButton: React.FC<AddLiquidityButtonProps> = ({
  mintAddress,
  tokenSymbol,
  disabled = false,
  className
}) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Jupiter swap URL (Note: Jupiter may not support all devnet tokens)
  const jupiterSwapUrl = `https://jup.ag/swap/${mintAddress}-${DEVNET_TOKENS.WSOL}`;
  
  // Raydium URL (Note: Raydium may not have devnet interface)
  const raydiumUrl = `https://raydium.io/liquidity/`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0",
            className
          )}
        >
          <Droplets className="w-4 h-4 mr-2" />
          Add Liquidity
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Add Liquidity for {tokenSymbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Devnet Notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your token was created on <strong>Solana devnet</strong>. Most DEX interfaces operate on mainnet only.
            </AlertDescription>
          </Alert>

          {/* Token Info */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Token Details:</div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Symbol:</span>
                <Badge variant="secondary">{tokenSymbol}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Mint Address:</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                    {mintAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(mintAddress, 'mint')}
                    className="h-6 w-6 p-0"
                  >
                    {copied === 'mint' ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="text-xs text-gray-600">Liquidity Options:</div>

            {/* Jupiter Option */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Jupiter Aggregator</div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Limited Devnet
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Jupiter primarily supports mainnet tokens. Your devnet token may not be available.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(jupiterSwapUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Try Jupiter (Experimental)
              </Button>
            </div>

            {/* Raydium Option */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Raydium</div>
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Mainnet Only
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                Raydium operates on mainnet. You'll need to deploy your token on mainnet first.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(raydiumUrl, '_blank')}
                disabled
                className="w-full opacity-50"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Raydium (Mainnet Required)
              </Button>
            </div>

            {/* Manual Instructions */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="font-medium text-sm">Manual Setup</div>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>For Devnet Testing:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Use devnet-compatible DEX or build custom AMM</li>
                  <li>Create liquidity pool with SOL or USDC pair</li>
                  <li>Provide initial liquidity using your minted tokens</li>
                  <li>Test swapping functionality</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Next Steps:</strong> Deploy your token on mainnet for full DEX integration, 
              or use devnet for testing custom AMM implementations.
            </AlertDescription>
          </Alert>

          {/* Explorer Link */}
          <Button
            variant="ghost"
            onClick={() => window.open(`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`, '_blank')}
            className="w-full text-sm"
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            View Token on Solana Explorer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};