import * as React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Rocket, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { createTokenWithWallet, validateTokenParams, getMintExplorerUrl, type TokenCreationParams, type TokenCreationResult } from "@/solana/createToken";
import { cn } from "@/lib/utils";

export interface LaunchTokenButtonProps {
  name: string;
  symbol: string;
  supply: number;
  decimals?: number;
  disabled?: boolean;
  className?: string;
  onStarted?: () => void;
  onSuccess?: (mintAddress: string, txSig: string) => void;
  onError?: (error: Error) => void;
}

export const LaunchTokenButton: React.FC<LaunchTokenButtonProps> = ({
  name,
  symbol,
  supply,
  decimals = 6,
  disabled = false,
  className,
  onStarted,
  onSuccess,
  onError
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [isLaunching, setIsLaunching] = React.useState(false);
  const [result, setResult] = React.useState<TokenCreationResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  // Validate parameters
  const validationErrors = React.useMemo(() => {
    return validateTokenParams({ name, symbol, supply, decimals });
  }, [name, symbol, supply, decimals]);

  const isValid = validationErrors.length === 0;
  const canLaunch = wallet.connected && isValid && !disabled && !isLaunching;

  const handleLaunch = async () => {
    if (!canLaunch) return;

    try {
      setIsLaunching(true);
      setError(null);
      setResult(null);
      
      onStarted?.();

      const params: TokenCreationParams = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        supply,
        decimals
      };

      const tokenResult = await createTokenWithWallet(connection, wallet, params);
      
      setResult(tokenResult);
      onSuccess?.(tokenResult.mintAddress, tokenResult.signature);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLaunching(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!wallet.connected) {
    return (
      <Alert>
        <AlertDescription>
          Connect your wallet to launch tokens on Solana devnet
        </AlertDescription>
      </Alert>
    );
  }

  if (!isValid) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {validationErrors.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Launch Button */}
      <Button
        onClick={handleLaunch}
        disabled={!canLaunch}
        className={cn(
          "w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold",
          className
        )}
      >
        {isLaunching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Launching Token...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4 mr-2" />
            Launch Token on Devnet
          </>
        )}
      </Button>

      {/* Token Details Preview */}
      <div className="text-sm text-muted-foreground space-y-1">
        <div>Name: <span className="font-medium">{name}</span></div>
        <div>Symbol: <span className="font-medium">{symbol.toUpperCase()}</span></div>
        <div>Supply: <span className="font-medium">{supply.toLocaleString()}</span></div>
        <div>Decimals: <span className="font-medium">{decimals}</span></div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Launch Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Display */}
      {result && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div className="font-semibold text-green-800">
                🎉 Token Launched Successfully!
              </div>
              
              {/* Mint Address */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-green-700">Mint Address:</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-green-100 px-2 py-1 rounded font-mono text-green-800 break-all">
                    {result.mintAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.mintAddress, 'mint')}
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

              {/* Transaction Signature */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-green-700">Transaction:</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-green-100 px-2 py-1 rounded font-mono text-green-800 break-all">
                    {result.signature}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.signature, 'tx')}
                    className="h-6 w-6 p-0"
                  >
                    {copied === 'tx' ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Explorer Links */}
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
                  onClick={() => window.open(result.explorerUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Transaction
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                  onClick={() => window.open(getMintExplorerUrl(result.mintAddress), '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Token
                </Badge>
              </div>

              <div className="text-xs text-green-600 mt-2">
                ✨ Tokens have been minted to your wallet on Solana devnet
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Devnet Notice */}
      <div className="text-xs text-muted-foreground text-center">
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          Devnet Only
        </Badge>
        <span className="ml-2">Tokens created on Solana devnet for testing</span>
      </div>
    </div>
  );
};