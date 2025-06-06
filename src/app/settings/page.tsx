
'use client';

import * as React from 'react';
import Image from 'next/image'; // Import next/image
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SidebarNavigation } from '@/components/sidebar-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Lock, Camera, Wallet, Copy, Gift } from 'lucide-react'; // Added Gift icon
import { useUser } from '@/context/user-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ConnectWalletButton } from '@/components/connect-wallet-button';
// Removed useAccount import as we are using a static address now

// Helper to truncate wallet address
const truncateAddress = (address: string | undefined) => {
    if (!address) return "N/A"; // Should not happen with static address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TIP_JAR_ADDRESS = "0x111080E59a5E7348b90136A85aC4F2d9887A8FE1";

export default function SettingsPage() {
  const { username, setUsername, profilePicture, setProfilePicture } = useUser();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [localUsername, setLocalUsername] = React.useState(username);
  const [localProfilePicture, setLocalProfilePicture] = React.useState<string | null>(profilePicture);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
      setLocalUsername(username);
  }, [username]);

  React.useEffect(() => {
      setLocalProfilePicture(profilePicture);
  }, [profilePicture]);


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUsername(e.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid File Type',
                    description: 'Please select an image file.',
                    variant: 'destructive',
                });
                 // Reset input value if file is invalid
                 if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalProfilePicture(reader.result as string);
                 // Reset input value after successful read to allow re-selection
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            };
             reader.onerror = () => {
                 toast({
                     title: 'File Read Error',
                     description: 'Could not read the selected file.',
                     variant: 'destructive',
                 });
                  // Reset input value on error
                 if (fileInputRef.current) {
                     fileInputRef.current.value = '';
                 }
             };
            reader.readAsDataURL(file);
        } else {
             // Reset input value if no file is selected (e.g., user cancels)
             if (fileInputRef.current) {
                 fileInputRef.current.value = '';
             }
        }
    };

   const handleSaveChanges = () => {
        let changesMade = false;
        if (localUsername !== username) {
            setUsername(localUsername);
            changesMade = true;
        }
        if (localProfilePicture !== profilePicture) {
            setProfilePicture(localProfilePicture);
            changesMade = true;
        }

        if (changesMade) {
             // Defer toast notification using setTimeout
            setTimeout(() => {
                toast({
                    title: "Settings Saved",
                    description: "Your profile details have been updated.",
                });
            }, 0);
        } else {
             // Defer toast notification using setTimeout
             setTimeout(() => {
                 toast({
                    title: "No Changes",
                    description: "No settings were modified.",
                     variant: "default"
                });
            }, 0);
        }
    };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

   const handleCopyTipJarAddress = () => {
        navigator.clipboard.writeText(TIP_JAR_ADDRESS)
            .then(() => {
                 setTimeout(() => {
                    toast({ title: "Tip Jar Address Copied!", description: TIP_JAR_ADDRESS });
                 }, 0);
            })
            .catch(err => {
                console.error("Failed to copy address:", err);
                 setTimeout(() => {
                    toast({ title: "Copy Failed", description: "Could not copy address to clipboard.", variant: "destructive"});
                 }, 0);
            });
    };


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
          <div className="flex flex-col items-center py-4">
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
         <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
             <div className="flex items-center gap-2">
               <SidebarTrigger className="md:hidden" />
               <div className="md:hidden">
                 <Image
                   src="https://i.ibb.co/bMgZz4h4/a-logo-for-a-crypto-learning-and-gaming-applicatio.png"
                   alt="ABC De-fi Logo"
                   width={80}
                   height={20}
                   className="h-auto mx-auto"
                   unoptimized
                 />
               </div>
             </div>
             <div className="ml-auto flex items-center gap-2">
               <ConnectWalletButton />
               <div className="md:hidden">
                 <ThemeToggleButton />
               </div>
             </div>
         </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 md:text-base">
          <div className="grid gap-6 max-w-2xl mx-auto">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><User size={20}/> Account</CardTitle>
                 <CardDescription>Manage your public profile and account details.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 cursor-pointer relative group" onClick={handleAvatarClick}>
                        <AvatarImage src={localProfilePicture ?? undefined} alt={username} className="object-cover" />
                        <AvatarFallback className="text-2xl">{username?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
                         <div className="absolute inset-0 bg-black/30 group-hover:opacity-100 opacity-0 flex items-center justify-center transition-opacity duration-200 rounded-full">
                            <Camera className="h-6 w-6 text-white" />
                         </div>
                    </Avatar>
                    <div className="space-y-1">
                        <Label htmlFor="profile-picture-upload" className="cursor-pointer text-sm font-medium text-primary hover:underline" onClick={handleAvatarClick}>
                            Change Picture
                        </Label>
                         <p className="text-xs text-muted-foreground">Click the avatar or text to upload an image (JPG, PNG).</p>
                         <Input
                            id="profile-picture-upload"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg"
                         />
                    </div>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="username">Username</Label>
                   <Input id="username" value={localUsername} onChange={handleUsernameChange} placeholder="Your public username" />
                 </div>
                 <Button onClick={handleSaveChanges}>Save Changes</Button>

                 {/* Tip Jar Section */}
                 <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                        <Gift size={16} className="text-primary"/> <span className="text-accent">Tip Jar</span>
                    </Label>
                    <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
                        <div className="flex items-center gap-2 overflow-hidden">
                             <Wallet size={16} className="text-muted-foreground flex-shrink-0"/>
                             <span className="text-sm text-muted-foreground truncate">
                                {truncateAddress(TIP_JAR_ADDRESS)}
                             </span>
                         </div>
                        <Button variant="ghost" size="icon" onClick={handleCopyTipJarAddress} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <Copy size={14} />
                            <span className="sr-only">Copy Tip Jar Address</span>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Enjoying the app? Consider sending a tip!</p>
                 </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Bell size={20}/> Notifications</CardTitle>
                 <CardDescription>Control how you receive notifications.</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="notifications-switch" className="flex flex-col space-y-1">
                        <span>Enable Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Receive updates about new quests and challenges.
                         </span>
                     </Label>
                    <Switch
                        id="notifications-switch"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                     />
                 </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Lock size={20}/> Security</CardTitle>
                 <CardDescription>Manage account security settings.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <Button variant="outline" disabled>Change Password (Not Implemented)</Button>
                   <Button variant="destructive" disabled>Delete Account (Not Implemented)</Button>
               </CardContent>
             </Card>

          </div>
        </main>
      </SidebarInset>
    </div>
  );
}

