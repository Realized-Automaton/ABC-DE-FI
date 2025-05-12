
import Image from 'next/image';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
// Updated icons: Removed Layers, added Token (using Coins as proxy), updated others
import { Check, Coins, ShieldCheck, Settings, BarChart3, Target, ScrollText, AlertTriangle, Gamepad2, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge as UiBadge } from '@/components/ui/badge'; // Renamed to avoid conflict with Lucide Badge
import { Leaderboard } from '@/components/leaderboard';
import { FaucetCard } from '@/components/faucet-card';
import { SwapCard } from '@/components/swap-card';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { UserProfileCard } from '@/components/user-profile-card';
import { CryptoInfographicCard } from '@/components/crypto-infographic-card';
// Removed LpCard import
import { AddCustomTokenCard } from '@/components/add-custom-token-card'; // Import the new card
import { ConnectWalletButton } from '@/components/connect-wallet-button';
import { DeFiDegenGame } from '@/components/defi-degen-game'; // Import DeFiDegenGame


// Mock data - replace with actual data fetching
// Updated quest 3 details
const quests = [
    { id: 1, title: "Mint Your First $CLASS Token", description: "Learn the basics of minting.", icon: <Gamepad2 />, completed: true, xp: 50 }, // Placeholder icon
    { id: 2, title: "Swap $CLASS for $XP", description: "Understand token swapping.", icon: <BookOpen />, completed: false, xp: 75 },
    { id: 3, title: "Add a Custom Token", description: "Import any ERC-20 to your wallet.", icon: <Coins />, completed: false, xp: 50 }, // Updated quest 3
    { id: 4, title: "Use the Faucet", description: "Get some free tokens.", icon: <ShieldCheck />, completed: false, xp: 50 },
    { id: 6, title: "Spot the Rug Pull", description: "Learn to identify risky projects.", icon: <Target />, completed: false, xp: 150 },
    { id: 7, title: "Survive Telegram Support", description: "Identify a common support scam.", icon: <AlertTriangle />, completed: false, xp: 100 },
    { id: 8, title: "Survive the Cycle", description: "Navigate the DeFi Degen Game.", icon: <Gamepad2 />, completed: false, xp: 250 },
];

export default function Home() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4 flex justify-center w-full">
          <Image
              src="https://i.ibb.co/bMgZz4h4/a-logo-for-a-crypto-learning-and-gaming-applicatio.png"
              alt="ABC De-fi Logo"
              width={120}
              height={30}
              className="h-auto mx-auto"
              unoptimized
          />
        </SidebarHeader>
        <SidebarContent className="p-4 flex-1">
          <SidebarNavigation />
          <div className="flex flex-col items-center py-4"> {/* Removed mt-auto */}
            <Image
              src="https://i.ibb.co/CKy4DsqZ/defi-made-simple.png"
              alt="DeFi Made Simple Banner"
              width={200}
              height={75}
              className="rounded-md"
              data-ai-hint="DeFi education"
              unoptimized
            />
          </div>
        </SidebarContent>
        <SidebarFooter className="p-4 flex items-center justify-between">
            <ThemeToggleButton />
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
                   className="h-auto mx-auto" // Center mobile logo
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
             <BookOpen className="h-5 w-5 text-primary hidden md:inline-block" />
             {/* Increased banner font size on small screens and up (sm:), medium and up (md:) */}
             {/* Updated Title */}
             <div className="text-center font-sans text-sm sm:text-base md:text-lg font-semibold text-primary bg-[#faf0dc] px-3 sm:px-6 py-1 rounded-full shadow-md">
                Master DeFi Fundamentals: Interactive Learning
             </div>
             <GraduationCap className="h-5 w-5 text-primary hidden md:inline-block" />
           </div>
         </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 md:text-base">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UserProfileCard className="col-span-1 h-full" />
            <CryptoInfographicCard className="col-span-1 h-full" />
            <Leaderboard className="lg:col-span-1 h-full" /> {/* Adjusted span */}

            <FaucetCard className="col-span-1 h-full" questId={4} xpReward={50} />
            <SwapCard className="col-span-1 h-full" questId={2} xpReward={75} />
            {/* Replace LpCard with AddCustomTokenCard */}
            <AddCustomTokenCard className="col-span-1 h-full" questId={3} xpReward={50} />

             {/* DeFiDegenGame added here */}
            <DeFiDegenGame className="md:col-span-2 lg:col-span-3 h-full" questId={8} xpReward={250} />

            {/* Completed Quests Card REMOVED from here */}

          </div>
        </main>
      </SidebarInset>
    </div>
  );
}

