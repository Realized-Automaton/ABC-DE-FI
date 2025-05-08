'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, CheckSquare, Info } from 'lucide-react'; // Added CheckSquare and Info
import { useToast } from '@/hooks/use-toast';
import { getAvailableTokens, type Token } from '@/services/token';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { cn } from '@/lib/utils'; // Import cn utility

// Mock swap function - replace with actual interaction
async function executeSwap(fromToken: string, toToken: string, amount: number): Promise<{ message: string; txHash: string }> {
  console.log(`Swapping ${amount} of ${fromToken} for ${toToken}`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  // Simulate potential error
  if (Math.random() < 0.1) {
     throw new Error("Swap simulation failed");
  }
  return {
    message: "Swap successful!",
    txHash: `0x${Math.random().toString(16).substring(2, 12)}...`,
  };
}

interface SwapCardProps {
  className?: string;
  questId: number; // ID of the quest associated with this card
  xpReward: number; // XP reward for completing the quest
}

export function SwapCard({ className, questId, xpReward }: SwapCardProps) {
  const { toast } = useToast();
  const { addXp } = useUser(); // Get addXp function
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [fromToken, setFromToken] = React.useState<string>('');
  const [toToken, setToToken] = React.useState<string>('');
  const [fromAmount, setFromAmount] = React.useState<string>('');
  const [toAmount, setToAmount] = React.useState<string>(''); // Calculated amount
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTokensLoading, setIsTokensLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false); // Track completion locally

  // TODO: Get actual quest completion status from a central state/context

  React.useEffect(() => {
    async function fetchTokens() {
      try {
        setIsTokensLoading(true);
        const availableTokens = await getAvailableTokens();
        setTokens(availableTokens);
        if (availableTokens.length >= 2) {
          setFromToken(availableTokens[0].address);
          setToToken(availableTokens[1].address);
        } else if (availableTokens.length === 1) {
           setFromToken(availableTokens[0].address);
        }
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        toast({
          title: "Error",
          description: "Could not load available tokens.",
          variant: "destructive",
        });
      } finally {
         setIsTokensLoading(false);
      }
    }
    fetchTokens();
  }, [toast]);

    // Mock price calculation
  React.useEffect(() => {
    const amount = parseFloat(fromAmount);
    if (!isNaN(amount) && fromToken && toToken && fromToken !== toToken) {
      // Simulate fetching price and calculating output - replace with actual logic
      const mockPrice = fromToken === tokens.find(t => t.symbol === 'CLASS')?.address ? 0.8 : 1.2; // Example fixed rate based on symbol
      setToAmount((amount * mockPrice).toFixed(4));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, tokens]);


  const handleSwap = async () => {
     const amount = parseFloat(fromAmount);
    if (!fromToken || !toToken || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select valid tokens and enter a positive amount.",
        variant: "destructive",
      });
      return;
    }
     if (fromToken === toToken) {
        toast({
            title: "Invalid Selection",
            description: "Cannot swap the same token.",
            variant: "destructive",
        });
        return;
    }


    setIsLoading(true);
    try {
      const response = await executeSwap(fromToken, toToken, amount);
      toast({
        title: "Swap Submitted!",
        description: `${response.message} Tx: ${response.txHash}`,
        variant: "default",
      });
      setFromAmount(''); // Clear amounts on success
      setToAmount('');

       // --- Add XP if quest is completed ---
      if (!isCompleted) { // Only award XP once
          addXp(xpReward);
          setIsCompleted(true); // Mark as completed visually
           // TODO: Update central quest completion state here
             // Defer toast notification using setTimeout
            setTimeout(() => {
               toast({
                   title: "Quest Complete!",
                   description: `You earned ${xpReward} XP for swapping tokens!`,
                   variant: "default"
               });
           }, 0);
      }
       // ------------------------------------


    } catch (error) {
      console.error("Swap failed:", error);
      toast({
        title: "Swap Failed",
        description: "The swap could not be completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchTokens = () => {
      if (isCompleted) return; // Don't allow switching if completed

      const tempToken = fromToken;
      setFromToken(toToken);
      setToToken(tempToken);

      const tempAmount = fromAmount;
      setFromAmount(toAmount); // Switch amounts visually

      // Recalculate 'toAmount' based on the new 'fromAmount'
      const newFromAmountParsed = parseFloat(toAmount);
       if (!isNaN(newFromAmountParsed) && toToken && tempToken && toToken !== tempToken && tokens.length > 0) {
           // Find the base token ('CLASS' in this mock setup)
           const classTokenAddress = tokens.find(t => t.symbol === 'CLASS')?.address;
           // Determine the correct mock price based on the *new* 'fromToken'
           const mockPrice = toToken === classTokenAddress ? 0.8 : 1.2;
           setToAmount((newFromAmountParsed * mockPrice).toFixed(4)); // Use the correct price for the new 'from' token
       } else {
           setToAmount('');
       }
  }

  return (
     <Card className={cn("flex flex-col", className)}> {/* Added flex flex-col */}
       <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="text-primary" /> Token Swap
          </CardTitle>
          <CardDescription>Exchange tokens. Completes Quest ID: {questId}</CardDescription>
         </div>
          <Popover>
            <PopoverTrigger asChild>
               <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground aspect-square")}> {/* Added aspect-square */}
                 <Info size={16} />
                  <span className="sr-only">Token Swap Info</span>
               </Button>
             </PopoverTrigger>
             <PopoverContent side="top" align="end" className="w-80" onClick={(e) => e.stopPropagation()}> {/* Added stopPropagation for mobile */}
               <p className="text-sm">Token swapping is a fundamental DeFi action. It allows you to trade one cryptocurrency for another directly on a Decentralized Exchange (DEX) without needing a central intermediary. This is crucial for accessing different projects and managing your portfolio.</p>
             </PopoverContent>
           </Popover>
      </CardHeader>
       <CardContent className="flex-1 flex flex-col justify-between space-y-4"> {/* Added flex-1 flex flex-col justify-between */}
        <div> {/* Wrap inputs/switch in a div */}
            {/* From Token Section */}
            <div className="space-y-2 rounded-md border p-3">
               <label htmlFor={`from-token-select-${questId}`} className="text-sm font-medium text-muted-foreground">From</label> {/* Unique ID */}
               <div className="flex gap-2">
                <Input
                    id={`from-amount-${questId}`} // Unique ID
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    disabled={isLoading || isTokensLoading || isCompleted}
                    className="flex-1"
                  />
                 <Select
                    value={fromToken}
                    onValueChange={setFromToken}
                    disabled={isTokensLoading || tokens.length === 0 || isCompleted}
                 >
                  <SelectTrigger id={`from-token-select-${questId}`} className="w-[120px]" aria-label="Select token to swap from"> {/* Unique ID */}
                    <SelectValue placeholder={isTokensLoading ? "..." : "Select"} />
                  </SelectTrigger>
                  <SelectContent>
                     {tokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                     {tokens.length === 0 && !isTokensLoading && (
                        <SelectItem value="no-tokens" disabled>No tokens</SelectItem>
                     )}
                  </SelectContent>
                </Select>
               </div>
            </div>

             {/* Switch Button */}
             <div className="flex justify-center my-2"> {/* Adjusted margin */}
                 <Button variant="ghost" size="icon" onClick={handleSwitchTokens} disabled={isLoading || isTokensLoading || tokens.length < 2 || isCompleted}>
                    <RefreshCw className="h-4 w-4 rotate-90"/>
                    <span className="sr-only">Switch Tokens</span>
                 </Button>
             </div>


            {/* To Token Section */}
             <div className="space-y-2 rounded-md border p-3">
               <label htmlFor={`to-token-select-${questId}`} className="text-sm font-medium text-muted-foreground">To (estimated)</label> {/* Unique ID */}
                <div className="flex gap-2">
                  <Input
                      id={`to-amount-${questId}`} // Unique ID
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      disabled // Estimated amount is not editable
                      className="flex-1 bg-muted"
                    />
                   <Select
                       value={toToken}
                       onValueChange={setToToken}
                       disabled={isTokensLoading || tokens.length === 0 || isCompleted}
                     >
                    <SelectTrigger id={`to-token-select-${questId}`} className="w-[120px]" aria-label="Select token to swap to"> {/* Unique ID */}
                      <SelectValue placeholder={isTokensLoading ? "..." : "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.address} value={token.address}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                       {tokens.length === 0 && !isTokensLoading && (
                            <SelectItem value="no-tokens" disabled>No tokens</SelectItem>
                       )}
                    </SelectContent>
                  </Select>
                 </div>
            </div>
         </div>


        {isCompleted ? (
             <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-auto"> {/* Added mt-auto */}
                 <CheckSquare size={16} /> Completed
             </Badge>
         ) : (
            <Button onClick={handleSwap} disabled={isLoading || isTokensLoading || !fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0 || fromToken === toToken} className="w-full mt-auto"> {/* Added mt-auto */}
              {isLoading ? 'Swapping...' : `Swap Tokens (+${xpReward} XP)`}
            </Button>
         )}
      </CardContent>
    </Card>
  );
}
