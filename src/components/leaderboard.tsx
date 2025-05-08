
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Info } from 'lucide-react'; // Import Info icon
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { Button } from '@/components/ui/button'; // Import Button
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { cn } from '@/lib/utils'; // Import cn

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: 'CryptoKing', xp: 1250, avatar: '/avatars/avatar1.png' },
  { rank: 2, name: 'DeFiDiva', xp: 1100, avatar: '/avatars/avatar2.png' },
  { rank: 3, name: 'NFTPioneer', xp: 980, avatar: '/avatars/avatar3.png' },
  { rank: 4, name: 'YieldYoda', xp: 850, avatar: '/avatars/avatar4.png' },
  { rank: 5, name: 'SatoshiJr', xp: 720, avatar: '/avatars/avatar5.png' },
   // Add more users if needed for scrolling test
   { rank: 6, name: 'BlockBaron', xp: 650, avatar: '/avatars/avatar6.png' },
   { rank: 7, name: 'ChainChamp', xp: 610, avatar: '/avatars/avatar7.png' },
   { rank: 8, name: 'AltcoinAce', xp: 580, avatar: '/avatars/avatar8.png' },
];


export function Leaderboard({ className }: { className?: string }) {
    // In a real app, fetch this data
    // Slice the data to get only the top 6 users
    const topUsers = leaderboardData.slice(0, 6);

    return (
        // Ensure the card itself is a flex column container
        <Card className={cn("flex flex-col h-full", className)}> {/* Added h-full */}
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Leaderboard
                    </CardTitle>
                    <CardDescription>Top 6 Questers by XP</CardDescription> {/* Updated description */}
                </div>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground aspect-square")}> {/* Added aspect-square */}
                      <Info size={16} />
                       <span className="sr-only">Leaderboard Info</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="end" className="w-80" onClick={(e) => e.stopPropagation()}> {/* Added stopPropagation for mobile */}
                    <p className="text-sm">See how you stack up against other De-fi Questers! Earn XP by completing quests and challenges to climb the ranks. Reaching the top might unlock... special surprises!</p>
                  </PopoverContent>
                </Popover>
            </CardHeader>
            {/* Make CardContent grow and make the table scrollable within it */}
            {/* Added flex-1 and overflow-hidden */}
            <CardContent className="flex-1 overflow-hidden p-4 pt-0"> {/* Changed padding */}
                 {/* Use h-full on ScrollArea to fill the CardContent */}
                 <ScrollArea className="h-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">XP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topUsers.map((user) => ( // Use the sliced topUsers array
                                <TableRow key={user.rank}>
                                    <TableCell className="font-medium">{user.rank}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage data-ai-hint="person avatar" src={`https://picsum.photos/seed/${user.name}/32/32`} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{user.xp}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </ScrollArea>
            </CardContent>
        </Card>
    );
}
