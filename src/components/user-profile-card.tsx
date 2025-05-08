
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/user-context'; // Import useUser hook
import { cn } from '@/lib/utils';
import { Trophy, UserCircle } from 'lucide-react'; // Import Trophy for badges section and UserCircle for fallback
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components


// Mock Data for badges - this should eventually come from user state/backend
const unlockedBadges = ['Intro Badge', 'Swap Master'];


export function UserProfileCard({ className }: { className?: string }) {
  const { username, xp, level, nextLevelXp, profilePicture } = useUser();
  const progressPercentage = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 0;

  const renderUsername = (name: string) => {
    if (!name || name.length === 0) {
      return "User";
    }

    const firstLetter = name.length > 0 ? <span style={{ color: '#da3322' }}>{name[0]}</span> : '';
    const secondLetter = name.length > 1 ? <span style={{ color: '#fbcb00' }}>{name[1]}</span> : '';
    const thirdLetter = name.length > 2 ? <span style={{ color: '#60c2a2' }}>{name[2]}</span> : '';
    const fourthLetter = name.length > 3 ? <span style={{ color: '#376e99' }}>{name[3]}</span> : '';
    const restOfName = name.substring(4);

    return (
        <>
            {firstLetter}
            {secondLetter}
            {thirdLetter}
            {fourthLetter}
            {restOfName}
        </>
    );
  };


  return (
    // Ensure the card itself is a flex column container to allow content to grow
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-12 w-12">
              <AvatarImage src={profilePicture ?? undefined} alt={username} className="object-cover" />
              <AvatarFallback>
                 {username ? username.charAt(0).toUpperCase() : <UserCircle size={24} />}
              </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{renderUsername(username)}&apos;s Progress</CardTitle>
            <CardDescription>Level {level}</CardDescription>
          </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-3 pt-4">
        <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span>XP: {Math.floor(xp)} / {Math.floor(nextLevelXp)}</span>
              <span className="text-xs text-muted-foreground">To Next Level</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
        </div>

        <div>
          <h4 className="font-medium mb-2 text-sm flex items-center gap-1"><Trophy size={16}/> Badges Unlocked:</h4>
          <div className="flex flex-wrap gap-1">
            {unlockedBadges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
            ))}
            {unlockedBadges.length === 0 && (
              <p className="text-xs text-muted-foreground">No badges unlocked yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
