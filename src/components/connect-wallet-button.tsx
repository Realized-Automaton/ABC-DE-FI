'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ConnectWalletButton() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Coming Soon!",
                description: "Wallet connect functionality is under development.",
            });
        }, 500);
    };

    return (
        <Button
            size="sm"
            onClick={handleClick}
            disabled={isLoading}
            className={cn(
                "flex items-center gap-2",
                "bg-accent text-accent-foreground hover:bg-accent/90"
            )}
        >
            <Wallet size={16} />
            {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}
