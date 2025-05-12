'use client';

import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export function ConnectWalletButton() {
    const isMobile = useIsMobile();
    const { toast } = useToast();

    const handleButtonClick = () => {
        // Show toast on click for mobile, and also for desktop as an additional feedback.
        // The primary purpose for desktop is still the hover tooltip.
        toast({
            title: "Sandbox Environment",
            description: "This is a safe learning space. No real funds are at risk!",
            duration: 4000, // Show toast for 4 seconds
        });
        // Future wallet connection logic would go here.
    };

    const buttonElement = (
        <Button
            size="sm"
            onClick={handleButtonClick}
            className={cn(
                "flex items-center gap-2",
                "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
            aria-label="Connect Wallet"
        >
            <Wallet size={16} />
            Connect Wallet
        </Button>
    );

    // Handle initial undefined state of isMobile to prevent hydration errors
    // and ensure consistent rendering during SSR and client-side hydration.
    if (isMobile === undefined) {
        return ( // Render a placeholder or disabled button until isMobile is determined
            <Button
                size="sm"
                className={cn(
                    "flex items-center gap-2",
                    "bg-accent text-accent-foreground hover:bg-accent/90 opacity-50 cursor-not-allowed"
                )}
                aria-label="Connect Wallet"
                disabled // Button is disabled while isMobile state is resolving
            >
                <Wallet size={16} />
                Connect Wallet
            </Button>
        );
    }

    if (isMobile) {
        // On mobile, return just the button. The onClick handler will show a toast.
        return buttonElement;
    } else {
        // On desktop, wrap the button with Tooltip components for hover functionality.
        // The onClick handler on the button will still show a toast.
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonElement}
                </TooltipTrigger>
                <TooltipContent>
                    <p>Sandbox Environment</p>
                    <p>This is a safe learning space. No real funds are at risk!</p>
                </TooltipContent>
            </Tooltip>
        );
    }
}
