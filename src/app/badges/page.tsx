
import Image from 'next/image'; // Import next/image
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react'; // Keep Trophy icon
import { ConnectWalletButton } from '@/components/connect-wallet-button'; // Import Connect Wallet button

export default function BadgesPage() {
  // Mock Data - replace with actual user badge data
  const unlockedBadges = ['Intro Badge', 'Swap Master', 'Faucet User'];
  const lockedBadges = ['LP Apprentice', 'Scam Spotter', 'Contract Caller'];

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
          <div className="grid gap-6">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500"/> Unlocked Badges</CardTitle>
                 <CardDescription>NFT Badges you've earned by completing quests and challenges.</CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {unlockedBadges.map((badgeName) => (
                   <div key={badgeName} className="flex flex-col items-center p-4 border rounded-lg bg-card shadow-sm">
                      {/* Placeholder for NFT Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mb-2 flex items-center justify-center text-primary-foreground">
                           <Trophy size={32}/>
                      </div>
                     <span className="text-sm font-medium text-center">{badgeName}</span>
                   </div>
                 ))}
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Trophy className="text-muted-foreground"/> Locked Badges</CardTitle>
                 <CardDescription>Keep questing to unlock these!</CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {lockedBadges.map((badgeName) => (
                   <div key={badgeName} className="flex flex-col items-center p-4 border rounded-lg bg-muted/50 shadow-sm opacity-60">
                     <div className="w-16 h-16 bg-muted rounded-full mb-2 flex items-center justify-center text-muted-foreground">
                         <Trophy size={32} />
                     </div>
                     <span className="text-sm font-medium text-center text-muted-foreground">{badgeName}</span>
                   </div>
                 ))}
               </CardContent>
             </Card>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
}
