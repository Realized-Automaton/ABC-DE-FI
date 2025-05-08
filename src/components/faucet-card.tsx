'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplet, CheckSquare, Info } from 'lucide-react'; // Added CheckSquare and Info
import { useToast } from '@/hooks/use-toast';
import { getAvailableTokens, type Token } from '@/services/token';
import { requestTokensFromFaucet } from '@/services/faucet';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { cn } from '@/lib/utils'; // Import cn utility


interface FaucetCardProps {
  className?: string;
  questId: number; // ID of the quest associated with this card
  xpReward: number; // XP reward for completing the quest
}


export function FaucetCard({ className, questId, xpReward }: FaucetCardProps) {
  const { toast } = useToast();
  const { addXp } = useUser(); // Get addXp function
  const [tokens, setTokens] = React.useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = React.useState<string>('');
  const [userAddress, setUserAddress] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTokensLoading, setIsTokensLoading] = React.useState(true);
  const [isCompleted, setIsCompleted] = React.useState(false); // Track completion locally for visual feedback

  // TODO: Get actual quest completion status from a central state/context
  // For now, we assume it's not completed initially and track locally

  React.useEffect(() => {
    async function fetchTokens() {
      try {
        setIsTokensLoading(true);
        const availableTokens = await getAvailableTokens();
        setTokens(availableTokens);
        if (availableTokens.length > 0) {
          setSelectedToken(availableTokens[0].address); // Default to first token
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

  const handleRequestTokens = async () => {
    if (!selectedToken || !userAddress) {
      toast({
        title: "Missing Information",
        description: "Please select a token and enter your address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await requestTokensFromFaucet(selectedToken, userAddress);
      toast({
        title: "Success!",
        description: `${response.message} Tx: ${response.txHash.substring(0, 10)}...`, // Shorten hash
        variant: "default", // Use default variant for success (typically green based on theme)
      });
      setUserAddress(''); // Clear address field on success

      // --- Add XP if quest is completed ---
      if (!isCompleted) { // Only award XP once
          addXp(xpReward);
          setIsCompleted(true); // Mark as completed visually
          // TODO: Update central quest completion state here
           // Defer toast notification using setTimeout
           setTimeout(() => {
                toast({
                    title: "Quest Complete!",
                    description: `You earned ${xpReward} XP for using the faucet!`,
                    variant: "default" // Or a specific 'success' variant
                });
            }, 0);
      }
       // ------------------------------------

    } catch (error) {
      console.error("Faucet request failed:", error);
      toast({
        title: "Faucet Request Failed",
        description: "Could not dispense tokens. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("flex flex-col", className)}> {/* Added flex flex-col */}
       <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="text-primary" /> Use the Faucet
          </CardTitle>
          <CardDescription>Get free classroom tokens. Completes Quest ID: {questId}</CardDescription>
        </div>
         <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground aspect-square")}> {/* Added aspect-square */}
              <Info size={16} />
               <span className="sr-only">Faucet Info</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-80" onClick={(e) => e.stopPropagation()}> {/* Added stopPropagation for mobile */}
            <p className="text-sm">Faucets provide free test tokens, allowing you to practice transactions like swapping or adding liquidity without risking real money. Essential for learning safely!</p>
          </PopoverContent>
        </Popover>
      </CardHeader>
       <CardContent className="flex-1 flex flex-col justify-between space-y-4"> {/* Added flex-1 flex flex-col justify-between */}
        <div> {/* Wrap inputs in a div */}
          <div className="space-y-2 mb-4"> {/* Add margin-bottom */}
             <label htmlFor={`token-select-${questId}`} className="text-sm font-medium">Select Token</label> {/* Unique ID */}
              <Select
                  value={selectedToken}
                  onValueChange={setSelectedToken}
                  disabled={isTokensLoading || tokens.length === 0 || isCompleted}
                >
                <SelectTrigger id={`token-select-${questId}`} aria-label="Select token"> {/* Unique ID */}
                  <SelectValue placeholder={isTokensLoading ? "Loading tokens..." : "Select a token"} />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                   {tokens.length === 0 && !isTokensLoading && (
                      <SelectItem value="no-tokens" disabled>No tokens available</SelectItem>
                   )}
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor={`user-address-${questId}`} className="text-sm font-medium">Your Wallet Address</label> {/* Unique ID */}
            <Input
              id={`user-address-${questId}`} // Unique ID
              placeholder="0x..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              disabled={isLoading || isCompleted}
            />
          </div>
         </div>

        {isCompleted ? (
             <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-auto"> {/* Added mt-auto */}
                 <CheckSquare size={16} /> Completed
             </Badge>
         ) : (
            <Button onClick={handleRequestTokens} disabled={isLoading || !selectedToken || !userAddress || isTokensLoading} className="mt-auto"> {/* Added mt-auto */}
              {isLoading ? 'Requesting...' : `Request Tokens (+${xpReward} XP)`}
            </Button>
         )}
      </CardContent>
    </Card>
  );
}
