
'use client'; // Add client directive

import type { ReactNode } from 'react';
import * as React from 'react'; // Import React
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useUser } from '@/context/user-context'; // Import useUser
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface QuestCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  xp: number;
  questId: number; // Add questId
  completed?: boolean;
  className?: string;
}

export function QuestCard({ title, description, icon, xp, questId, completed = false, className }: QuestCardProps) {
  const { addXp } = useUser();
  const { toast } = useToast();
   // Local state to track if this specific quest card instance triggered completion
   // This prevents awarding XP multiple times if the main quest list updates slowly
  const [isCompletedLocally, setIsCompletedLocally] = React.useState(completed);

  // TODO: Implement a proper quest completion system (e.g., using context or backend)
  // This is a placeholder to simulate starting a quest.
  const handleStartQuest = () => {
    console.log(`Starting quest: ${title} (ID: ${questId})`);
    toast({
      title: "Quest Started!",
      description: `Get ready for: ${title}`,
    });

    // --- Placeholder for quest completion ---
    // In a real app, the actual quest component (like SwapCard, FaucetCard)
    // would call `addXp` and potentially update a global quest state.
    // This timeout simulates completing the quest via this button for testing.
    // REMOVE THIS TIMEOUT IN PRODUCTION - completion should happen in the specific component.
     /*
     setTimeout(() => {
         if (!isCompletedLocally) {
             console.log(`DEBUG: Simulating completion for Quest ${questId}`);
             addXp(xp);
             setIsCompletedLocally(true); // Update local state
             toast({
                 title: "Quest Complete (Simulated)!",
                 description: `You earned ${xp} XP for completing ${title}!`,
             });
             // TODO: Update global quest completion state here
         }
     }, 5000); // Simulate completion after 5 seconds
     */
    // ---------------------------------------
  };


  // Update local state if the 'completed' prop changes from upstream
  React.useEffect(() => {
      setIsCompletedLocally(completed);
  }, [completed]);


  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
         <div className="rounded-full border bg-card p-2 text-primary">
            {icon}
         </div>
        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {isCompletedLocally && <CheckCircle className="text-accent" />}
      </CardHeader>
      <CardContent className="mt-auto flex flex-col items-start gap-2">
         <div className="text-sm text-muted-foreground">Reward: {xp} XP</div>
        {!isCompletedLocally ? (
          <Button size="sm" onClick={handleStartQuest}>Start Quest</Button>
        ) : (
           <span className="text-sm font-medium text-accent">Completed!</span>
        )}
      </CardContent>
    </Card>
  );
}
