import * as React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

export const WalletInfo: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!mounted) return;
        setBalance(lamports / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error("Error fetching balance:", error);
        if (mounted) setBalance(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [publicKey, connection]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Solana Wallet
        </CardTitle>
        <Badge variant="secondary">Devnet</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <WalletMultiButton className="!w-full" />
          
          {publicKey && (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Address:</p>
                <p className="text-sm font-mono truncate" title={publicKey.toBase58()}>
                  {publicKey.toBase58()}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Balance:</p>
                <p className="text-sm font-semibold">
                  {loading ? (
                    "Loading..."
                  ) : balance !== null ? (
                    `${balance.toFixed(6)} SOL`
                  ) : (
                    "Error loading balance"
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};