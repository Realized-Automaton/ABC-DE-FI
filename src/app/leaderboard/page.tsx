
import Image from 'next/image'; // Import next/image
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { Leaderboard } from '@/components/leaderboard'; // Reuse the leaderboard component
import { ConnectWalletButton } from '@/components/connect-wallet-button'; // Import Connect Wallet button

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-screen w-full">
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
          <SidebarNavigation />
        </SidebarContent>
        <SidebarFooter className="p-4 flex items-center justify-between">
          <ThemeToggleButton />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col">
         <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
             {/* Container for Trigger and Mobile Logo */}
             <div className="flex items-center gap-2">
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
             {/* Container for Buttons */}
             <div className="ml-auto flex items-center gap-2"> {/* Use ml-auto to push buttons right */}
               <ConnectWalletButton />
               <div className="md:hidden"> {/* Mobile Theme Toggle */}
                 <ThemeToggleButton />
               </div>
             </div>
         </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 md:text-base"> {/* Added md:text-base */}
          {/* Reuse the Leaderboard component */}
          <Leaderboard className="lg:col-span-2 h-full" /> {/* Added h-full */}
           {/* Could add more leaderboard views here, e.g., weekly, all-time */}
        </main>
      </SidebarInset>
    </div>
  );
}
