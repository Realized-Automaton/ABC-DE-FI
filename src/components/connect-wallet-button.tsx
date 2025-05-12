'use client';

import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components

export function ConnectWalletButton() {
    // Removed toast and isLoading state as they are no longer needed for hover tooltip

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="sm"
                    // Removed onClick and disabled props
                    className={cn(
                        "flex items-center gap-2",
                        "bg-accent text-accent-foreground hover:bg-accent/90"
                    )}
                    aria-label="Connect Wallet" // Added aria-label for accessibility
                >
                    <Wallet size={16} />
                    Connect Wallet
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Sandbox Environment</p>
                <p>This is a safe learning space. No real funds are at risk!</p>
            </TooltipContent>
        </Tooltip>
    );
}
