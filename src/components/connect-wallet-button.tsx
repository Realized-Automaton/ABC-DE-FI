
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors'; // Import specific connectors or all from config

// Helper to truncate wallet address
const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export function ConnectWalletButton() {
    const { toast } = useToast();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { address, isConnected } = useAccount();

    const handleConnect = () => {
        // Use the injected connector (MetaMask, Rabby, etc.)
        // You could also iterate through `connectors` from `useConnect` to offer choices
        connect({ connector: injected() }, {
            onError: (error) => {
                console.error("Connection failed:", error);
                toast({
                    title: "Connection Failed",
                    description: error.message || "Could not connect wallet. Please try again.",
                    variant: "destructive",
                });
            },
            onSuccess: () => {
                 toast({
                    title: "Wallet Connected",
                    description: `Connected as ${truncateAddress(address || "")}`,
                    variant: "default",
                });
            }
        });
    };

    const handleDisconnect = () => {
        disconnect(undefined, {
             onSuccess: () => {
                toast({
                    title: "Wallet Disconnected",
                    variant: "default",
                });
            }
        });
    };

     const handleCopyAddress = () => {
        if (!address) return;
        navigator.clipboard.writeText(address)
            .then(() => {
                toast({ title: "Address Copied!", description: address });
            })
            .catch(err => {
                console.error("Failed to copy address:", err);
                toast({ title: "Copy Failed", description: "Could not copy address to clipboard.", variant: "destructive"});
            });
    };


    if (isConnected && address) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                         variant="outline" // Use outline when connected
                         size="sm"
                         className={cn(
                            "flex items-center gap-2",
                             // Use secondary colors for connected state outline button
                            "border-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                    >
                        <Wallet size={16} />
                        {truncateAddress(address)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
                     <DropdownMenuItem onClick={handleCopyAddress} className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy Address</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDisconnect} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Disconnect</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button
            size="sm"
            onClick={handleConnect}
            className={cn(
                "flex items-center gap-2",
                "bg-accent text-accent-foreground hover:bg-accent/90" // Use accent color for connect button
            )}
        >
            <Wallet size={16} />
            Connect Wallet
        </Button>
    );
}
