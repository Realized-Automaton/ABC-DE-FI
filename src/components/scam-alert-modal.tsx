'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Gift, AlertTriangle, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

interface ScamAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmScam: () => void;
  onConfirmSign: () => void; // Renamed for clarity
}

export function ScamAlertModal({
  open,
  onOpenChange,
  onConfirmScam,
  onConfirmSign,
}: ScamAlertModalProps) {

  // Prevent closing via overlay click or escape key to force interaction
  const handleInteractOutside = (event: Event) => {
     event.preventDefault();
  };

   const handleEscapeKeyDown = (event: KeyboardEvent) => {
     event.preventDefault();
  };


  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
         onInteractOutside={handleInteractOutside}
         onEscapeKeyDown={handleEscapeKeyDown}
         className="max-w-md border-yellow-500 border-2 shadow-lg shadow-yellow-500/30" // Added visual cue and constrained max-width
      >
        <AlertDialogHeader className="flex flex-col items-center text-center">
           {/* Simulate Metamask/Wallet Icon */}
           <div className="mb-3 rounded-full border p-2 bg-gradient-to-br from-orange-400 to-red-500">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" // Metamask logo URL
                alt="Wallet Icon"
                width={40}
                height={40}
                className="invert dark:invert-0" // Adjust for theme if needed
              />
            </div>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="text-primary" size={24}/> Free NFT Airdrop!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground mt-2 px-4">
            A new DApp <span className="font-semibold text-primary">"FreeNFTsRUs.xyz"</span> wants to connect to your wallet to send you a <span className="font-bold">FREE Limited Edition NFT!</span>
          </AlertDialogDescription>
           <div className="mt-4 p-3 border rounded-md bg-muted/50 w-full text-sm">
               <p className="font-semibold mb-1">Action Required:</p>
               <p className="text-muted-foreground">Sign transaction to claim your NFT.</p>
               <p className="text-xs mt-2">Gas Estimate: <span className="font-mono">0.00 ETH</span></p>
               <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><AlertTriangle size={12}/> Review transaction details carefully before signing.</p>
           </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-4 mt-4">
          {/* "Scam" Button */}
          <Button
            variant="destructive" // Use destructive variant for the "Scam" button
            onClick={onConfirmScam}
            className="flex items-center gap-1"
          >
            <ShieldAlert size={16} /> This is a SCAM!
          </Button>

           {/* Simulated "Sign" Button */}
           <Button
             variant="default" // Use default (could be styled green via theme)
             onClick={onConfirmSign}
             className="bg-accent hover:bg-accent/90 text-accent-foreground" // Use accent theme colors
           >
             Sign & Claim NFT
           </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}