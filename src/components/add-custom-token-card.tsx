
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Label
import { Coins, CheckSquare, Info } from 'lucide-react'; // Updated icon
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { cn } from '@/lib/utils'; // Import cn utility

// Mock add custom token function - replace with actual wallet interaction if needed for UI feedback
async function addCustomToken(tokenAddress: string): Promise<{ message: string }> {
  console.log(`Attempting to add custom token: ${tokenAddress}`);
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate action delay

  // Simulate potential error (e.g., invalid address format)
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
     throw new Error("Invalid token address format.");
  }

  // In a real scenario, you'd use a library like ethers or wagmi to prompt wallet addition
  return {
    message: "Token added successfully to wallet! (Simulated)",
  };
}

interface AddCustomTokenCardProps {
  className?: string;
  questId: number; // ID of the quest associated with this card
  xpReward: number; // XP reward for completing the quest
}

export function AddCustomTokenCard({ className, questId, xpReward }: AddCustomTokenCardProps) {
  const { toast } = useToast();
  const { addXp } = useUser(); // Get addXp function
  const [tokenAddress, setTokenAddress] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false); // Track completion locally

  const handleAddToken = async () => {
     if (!tokenAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter a token contract address.",
        variant: "destructive",
      });
      return;
    }

    // Basic address validation (example)
    if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
       toast({
         title: "Invalid Address",
         description: "Please enter a valid Ethereum contract address (starts with 0x, 42 characters).",
         variant: "destructive",
       });
       return;
    }


    setIsLoading(true);
    try {
      // Simulate adding the token (in reality, this might just guide the user or use wallet APIs)
      const response = await addCustomToken(tokenAddress);
      toast({
        title: "Token Added!",
        description: `${response.message}`,
        variant: "default",
      });
      setTokenAddress(''); // Clear address field on success

      if (!isCompleted) {
          addXp(xpReward);
          setIsCompleted(true);
            setTimeout(() => {
               toast({
                   title: "Quest Complete!",
                   description: `You earned ${xpReward} XP for adding a custom token!`,
                   variant: "default"
               });
            }, 0);
      }
    } catch (error: any) {
      console.error("Add custom token failed:", error);
      toast({
        title: "Failed to Add Token",
        description: error.message || "Could not add the token. Please check the address and try again.",
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
                <Coins className="text-primary" /> Add a Custom Token
              </CardTitle>
              <CardDescription>How to import any ERC-20 into your wallet. Quest ID: {questId}</CardDescription>
          </div>
           <Popover>
             <PopoverTrigger asChild>
                <Button className={cn("h-8 w-8 p-1.5 bg-accent text-accent-foreground hover:bg-accent/90")}>
                  <Info size={16} />
                   <span className="sr-only">Custom Token Info</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm">Sometimes, new or less common tokens don't automatically appear in your wallet. Adding a custom token using its contract address allows your wallet (like MetaMask) to recognize and display its balance. This is essential for seeing airdrops or interacting with specific dApps.</p>
              </PopoverContent>
          </Popover>
      </CardHeader>
       <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="space-y-2">
                        <Label htmlFor={`token-address-${questId}`}>Token Contract Address</Label>
                        <Input
                            id={`token-address-${questId}`}
                            type="text"
                            placeholder="0x..."
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            disabled={isLoading || isCompleted}
                        />
                         <p className="text-xs text-muted-foreground pt-1">Find this on a block explorer like Etherscan.</p>
                    </div>
                 </div>

                {isCompleted ? (
                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-auto">
                        <CheckSquare size={16} /> Completed
                    </Badge>
                ) : (
                    <Button
                        onClick={handleAddToken}
                        disabled={isLoading || !tokenAddress}
                        className="w-full mt-auto"
                    >
                        {isLoading ? 'Adding Token...' : `Add Token (+${xpReward} XP)`}
                    </Button>
                )}
            </div>
      </CardContent>
    </Card>
  );
}
