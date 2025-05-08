
'use client'; // Add 'use client' directive

import * as React from 'react'; // Import React
import Image from 'next/image'; // Import next/image
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { WhackAScammerGame } from '@/components/whack-a-scammer-game';
import { CryptoQuiz } from '@/components/crypto-quiz';
import { ConnectWalletButton } from '@/components/connect-wallet-button'; // Import Connect Wallet button
import { Gamepad2, Skull } from 'lucide-react'; // Import icons for header, replaced TrendingUp with Gamepad2
import { ScamAlertModal } from '@/components/scam-alert-modal'; // Import the new modal component
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { useUser } from '@/context/user-context'; // Import useUser
import { TelegramScamChatChallenge } from '@/components/telegram-scam-chat-challenge'; // Import the new challenge component
import { RugPullCard } from '@/components/rug-pull-card'; // Import RugPullCard
// Removed DeFiDegenGame import



export default function ChallengesPage() {
  const [isScamModalOpen, setIsScamModalOpen] = React.useState(false);
  const [scamModalShown, setScamModalShown] = React.useState(false); // Track if shown once per session/mount
  const { toast } = useToast();
  const { addXp } = useUser();
  const SCAM_SPOT_XP_REWARD = 5; // XP for spotting the scam - Updated to 5

  React.useEffect(() => {
    // Only set the timer if the modal hasn't been shown yet in this session
    if (!scamModalShown) {
      const timer = setTimeout(() => {
        setIsScamModalOpen(true);
        setScamModalShown(true); // Mark as shown
      }, 3000); // Changed delay from 8000 to 3000 (3 seconds)

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [scamModalShown]); // Dependency array ensures this runs only when scamModalShown changes

  const handleConfirmScam = () => {
     // Award XP only once for spotting the scam
     // In a real app, you'd track completion state more robustly
    if (scamModalShown) { // Check if it was shown (implies first interaction)
        addXp(SCAM_SPOT_XP_REWARD);
         setTimeout(() => { // Defer toast
            toast({
              title: "Scam Avoided! 🎉",
              description: `Great job! You spotted your first scam and earned ${SCAM_SPOT_XP_REWARD} XP. Always be vigilant!`, // Updated description
              variant: "success", // Use new success variant
              duration: 3000, // Set duration to 3 seconds
            });
        }, 0);
        // Potentially disable re-rewarding here if needed
    }
    setIsScamModalOpen(false); // Close modal
  };

  const handleConfirmSign = () => {
     setTimeout(() => { // Defer toast
        toast({
          title: <>Uh Oh! You&apos;re Rekt! <Skull className="inline-block h-4 w-4 ml-1" /></>, // Updated title with icon
          description: "Signing unknown transactions can be risky. Luckily, this was just a simulation! Always verify DApps and transaction details.", // Updated description
          variant: "destructive", // Use destructive (red) style for warning/failure
          duration: 3000, // Set duration to 3 seconds
        });
    }, 0);
    setIsScamModalOpen(false); // Close modal
  };


  return (
    <div className="flex min-h-screen w-full">
       {/* Replicated Sidebar structure for consistency - Ideally abstract this layout */}
       <Sidebar>
        <SidebarHeader className="p-4 flex justify-center w-full"> {/* Ensure flex and justify-center */}
          {/* Replace text with larger logo */}
          <Image
              src="https://i.ibb.co/bMgZz4h4/a-logo-for-a-crypto-learning-and-gaming-applicatio.png" // Updated logo URL
              alt="ABC De-fi Logo" // Updated alt text
              width={120} // Increased width
              height={30} // Increased height proportionally or adjust as needed
              className="h-auto mx-auto" // Maintain aspect ratio and add mx-auto
              unoptimized // If using external hosting like ibb without pro plan
          />
        </SidebarHeader>
        <SidebarContent className="p-4 flex-1">
           <SidebarNavigation /> {/* Use the navigation component */}
        </SidebarContent>
         <SidebarFooter className="p-4 flex items-center justify-between"> {/* Changed back to flex-row and justify-between */}
             <ThemeToggleButton />
             {/* Removed DownloadSourceCodeButton */}
         </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
         {/* Updated Header Structure for Responsiveness */}
         <header className="sticky top-0 z-10 flex flex-col md:flex-row md:h-[57px] md:items-center gap-2 border-b bg-background px-4 py-2 md:py-0"> {/* Adjusted padding for mobile */}
           {/* Row 1 (Mobile) / Part 1 (Desktop): Trigger, Logo, Buttons */}
           <div className="flex w-full items-center justify-between md:w-auto">
             <div className="flex items-center gap-2"> {/* Group Trigger and Logo */}
               <SidebarTrigger className="md:hidden" />
               {/* Logo for mobile view */}
               <div className="md:hidden">
                 <Image
                   src="https://i.ibb.co/bMgZz4h4/a-logo-for-a-crypto-learning-and-gaming-applicatio.png"
                   alt="ABC De-fi Logo"
                   width={80} // Smaller width for mobile header
                   height={20} // Adjust height proportionally
                   className="h-auto"
                   unoptimized
                 />
               </div>
             </div>
             <div className="flex items-center gap-2 ml-auto md:ml-0"> {/* Buttons group */}
               <ConnectWalletButton />
               <div className="md:hidden"> {/* Mobile Theme Toggle */}
                 <ThemeToggleButton />
               </div>
             </div>
           </div>
           {/* Row 2 (Mobile) / Part 2 (Desktop): Banner (Centered) */}
           <div className="flex w-full items-center justify-center gap-1 sm:gap-2 md:flex-1 md:order-first"> {/* Centered banner, takes remaining space on desktop, positioned first on desktop */}
             <Gamepad2 className="h-5 w-5 text-primary hidden md:inline-block" /> {/* Keep icon */}
             {/* Increased banner font size on small screens and up (sm:), medium and up (md:) */}
             <div className="text-center font-sans text-sm sm:text-base md:text-lg font-semibold text-primary bg-[#faf0dc] px-3 sm:px-6 py-1 rounded-full shadow-md">
               Challenges &amp; Scam Quests to Boost Your Crypto IQ {/* Capitalized 'Q' */}
             </div>
             <Skull className="h-5 w-5 text-primary hidden md:inline-block" />
           </div>
         </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 md:text-base"> {/* Added md:text-base */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">

            <WhackAScammerGame className="lg:col-span-1" />
            <CryptoQuiz className="lg:col-span-1" />
            <TelegramScamChatChallenge className="lg:col-span-2" questId={7} xpReward={100} />
            {/* DeFiDegenGame removed from here */}
            <RugPullCard className="lg:col-span-2" questId={6} xpReward={150} />


          </div>
        </main>
      </SidebarInset>

       <ScamAlertModal
         open={isScamModalOpen}
         onOpenChange={setIsScamModalOpen}
         onConfirmScam={handleConfirmScam}
         onConfirmSign={handleConfirmSign}
       />
    </div>
  );
}
