
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Label
import { Layers, Plus, CheckSquare, Info } from 'lucide-react'; // Added Plus, CheckSquare and Info
import { useToast } from '@/hooks/use-toast';
import { getAvailableTokens, type Token } from '@/services/token';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { cn } from '@/lib/utils'; // Import cn utility

// Mock add liquidity function - replace with actual interaction
async function addLiquidity(tokenA: Token, tokenB: Token, amountA: number, amountB: number): Promise<{ message: string; txHash: string }> {
  console.log(`Adding liquidity: ${amountA} ${tokenA.symbol} and ${amountB} ${tokenB.symbol}`);
  await new Promise(resolve => setTimeout(resolve, 1700)); // Simulate network delay

  // Simulate potential error
  if (Math.random() < 0.1) {
     throw new Error("Add liquidity simulation failed");
  }

  // In a real scenario, you'd receive LP tokens
  return {
    message: "Liquidity added successfully!",
    txHash: `0x${Math.random().toString(16).substring(2, 12)}...`,
  };
}

interface LpCardProps {
  className?: string;
  questId: number; // ID of the quest associated with this card
  xpReward: number; // XP reward for completing the quest
}

export function LpCard({ className, questId, xpReward }: LpCardProps) {
  const { toast } = useToast();
  const { addXp } = useUser(); // Get addXp function
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [tokenA, setTokenA] = React.useState<Token | null>(null); // Store full token object
  const [tokenB, setTokenB] = React.useState<Token | null>(null); // Store full token object
  const [amountA, setAmountA] = React.useState<string>('');
  const [amountB, setAmountB] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTokensLoading, setIsTokensLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false); // Track completion locally

  React.useEffect(() => {
    async function fetchTokens() {
      try {
        setIsTokensLoading(true);
        const availableTokens = await getAvailableTokens();
        setTokens(availableTokens);
        const classToken = availableTokens.find(t => t.symbol === 'CLASS');
        const xpToken = availableTokens.find(t => t.symbol === 'XP');
        if (classToken) setTokenA(classToken);
        if (xpToken) setTokenB(xpToken);
      } catch (error) {
        console.error("Failed to fetch tokens for LP:", error);
        toast({
          title: "Error",
          description: "Could not load tokens for liquidity pool.",
          variant: "destructive",
        });
      } finally {
         setIsTokensLoading(false);
      }
    }
    fetchTokens();
  }, [toast]);

  React.useEffect(() => {
    const inputAmountA = parseFloat(amountA);
    const inputAmountB = parseFloat(amountB);
    const ratio = 0.8;

    if (document.activeElement?.id === `amount-a-${questId}` && !isNaN(inputAmountA) && inputAmountA >= 0) {
        setAmountB((inputAmountA * ratio).toFixed(4));
    } else if (document.activeElement?.id === `amount-b-${questId}` && !isNaN(inputAmountB) && inputAmountB >= 0) {
        setAmountA((inputAmountB / ratio).toFixed(4));
    }
  }, [amountA, amountB, questId]);

  const handleAddLiquidity = async () => {
     const numAmountA = parseFloat(amountA);
     const numAmountB = parseFloat(amountB);

    if (!tokenA || !tokenB || isNaN(numAmountA) || numAmountA <= 0 || isNaN(numAmountB) || numAmountB <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid positive amounts for both tokens.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await addLiquidity(tokenA, tokenB, numAmountA, numAmountB);
      toast({
        title: "Liquidity Added!",
        description: `${response.message} Tx: ${response.txHash}`,
        variant: "default",
      });
      setAmountA('');
      setAmountB('');

      if (!isCompleted) {
          addXp(xpReward);
          setIsCompleted(true);
            setTimeout(() => {
               toast({
                   title: "Quest Complete!",
                   description: `You earned ${xpReward} XP for providing liquidity!`,
                   variant: "default"
               });
            }, 0);
      }
    } catch (error) {
      console.error("Add liquidity failed:", error);
      toast({
        title: "Failed to Add Liquidity",
        description: "The transaction could not be completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <Card className={cn("flex flex-col h-full", className)}>
       <CardHeader className="flex flex-row items-start justify-between">
          <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="text-primary" /> Provide Liquidity (LP)
              </CardTitle>
              <CardDescription>Combine tokens to earn fees. Completes Quest ID: {questId}</CardDescription>
          </div>
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground aspect-square")}>
                  <Info size={16} />
                   <span className="sr-only">LP Info</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm">Providing liquidity (LP) means adding pairs of tokens to a pool on a DEX. This allows others to swap between those tokens. In return, LPs earn a share of the trading fees generated by the pool. It's a key way to participate in DeFi yield generation.</p>
              </PopoverContent>
          </Popover>
      </CardHeader>
       <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {isTokensLoading ? (
            <p className="text-sm text-muted-foreground">Loading tokens...</p>
        ) : !tokenA || !tokenB ? (
            <p className="text-sm text-destructive">Required CLASS or XP token not found.</p>
        ) : (
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="space-y-2">
                        <Label htmlFor={`amount-a-${questId}`}>Amount of {tokenA.symbol}</Label>
                        <Input
                            id={`amount-a-${questId}`}
                            type="number"
                            placeholder="0.0"
                            value={amountA}
                            onChange={(e) => setAmountA(e.target.value)}
                            disabled={isLoading || isCompleted}
                            min="0"
                        />
                    </div>

                    <div className="flex justify-center items-center text-muted-foreground my-2">
                        <Plus size={16} />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor={`amount-b-${questId}`}>Amount of {tokenB.symbol}</Label>
                        <Input
                            id={`amount-b-${questId}`}
                            type="number"
                            placeholder="0.0"
                            value={amountB}
                            onChange={(e) => setAmountB(e.target.value)}
                            disabled={isLoading || isCompleted}
                             min="0"
                        />
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 text-center mt-2">
                        (Note: In a real DEX, the amounts are linked by the current pool price ratio.)
                    </div>
                 </div>

                {isCompleted ? (
                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-auto">
                        <CheckSquare size={16} /> Completed
                    </Badge>
                ) : (
                    <Button
                        onClick={handleAddLiquidity}
                        disabled={isLoading || !amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0}
                        className="w-full mt-auto"
                    >
                        {isLoading ? 'Adding Liquidity...' : `Add Liquidity (+${xpReward} XP)`}
                    </Button>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
