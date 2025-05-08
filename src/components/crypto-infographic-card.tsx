
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wallet, RefreshCw, Coins, ShieldCheck, Lightbulb } from 'lucide-react';

interface CryptoInfographicCardProps {
  className?: string;
}

export function CryptoInfographicCard({ className }: CryptoInfographicCardProps) {
  return (
    // Ensure the card itself is a flex column container
    <Card className={cn(
        "flex flex-col", // Keep flex-col
        "bg-gradient-to-br from-primary/10 to-accent/10",
        className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" /> DeFi Basics</CardTitle>
        <CardDescription>Key concepts at a glance</CardDescription>
      </CardHeader>
      {/* Changed justify-around to justify-between */}
      {/* Ensure consistent padding */}
      <CardContent className="flex flex-1 flex-col justify-between space-y-3 overflow-hidden p-4 pt-0"> {/* Changed space-y-2 to space-y-3 for slightly more spacing if needed */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-full text-primary flex-shrink-0">
             <Wallet size={18} /> {/* Slightly smaller icon */}
          </div>
          <div>
            <h4 className="font-semibold">Wallets</h4>
            <p className="text-muted-foreground text-xs">Your digital address to send, receive, and store crypto.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="p-2 bg-accent/20 rounded-full text-accent flex-shrink-0">
               <RefreshCw size={18} /> {/* Slightly smaller icon */}
           </div>
          <div>
            <h4 className="font-semibold">Swapping</h4>
            <p className="text-muted-foreground text-xs">Trading one type of crypto token for another on a DEX.</p>
          </div>
        </div>

         <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-full text-secondary-foreground flex-shrink-0">
                 <Coins size={18} /> {/* Slightly smaller icon */}
            </div>
           <div>
             <h4 className="font-semibold">Liquidity Pools (LPs)</h4>
             <p className="text-muted-foreground text-xs">Pairs of tokens locked in a smart contract to facilitate swaps.</p>
           </div>
         </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 rounded-full text-destructive flex-shrink-0">
                <ShieldCheck size={18} /> {/* Slightly smaller icon */}
            </div>
           <div>
             <h4 className="font-semibold">Security</h4>
             <p className="text-muted-foreground text-xs">Always DYOR (Do Your Own Research) and be wary of scams.</p>
           </div>
         </div>
      </CardContent>
    </Card>
  );
}

