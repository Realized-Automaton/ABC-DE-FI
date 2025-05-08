'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X, Zap, CheckSquare, Info } from 'lucide-react'; // Added CheckSquare and Info
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components


// Mock data for rug pull scenarios
const scenarios = [
  {
    id: 1,
    name: 'HONEYPOT Token',
    description: 'Promises 1000x gains daily! Liquidity locked for only 1 hour. Anonymous team.',
    isRug: true,
    redFlags: ['Extremely high unrealistic gains', 'Short liquidity lock', 'Anonymous team'],
  },
  {
    id: 2,
    name: 'Solid Project Coin (SPC)',
    description: 'Focuses on building a real utility dApp. Team is public and doxxed. Liquidity locked for 1 year.',
    isRug: false,
    greenFlags: ['Realistic goals', 'Public team', 'Long liquidity lock'],
  },
  {
    id: 3,
    name: 'MoonRocket Inu',
    description: 'Just launched! Huge marketing push on social media. Contract has a function allowing the owner to disable selling.',
    isRug: true,
    redFlags: ['Hype-driven name', 'Function to disable selling (honeypot characteristic)', 'Overly aggressive marketing'],
  },
   {
    id: 4,
    name: 'Dev Team Token (DTT)',
    description: 'Token contract verified on Etherscan. Audit completed by a reputable firm. Clear roadmap and whitepaper available.',
    isRug: false,
    greenFlags: ['Verified contract', 'Reputable audit', 'Clear documentation'],
  }
];

type AnswerState = 'correct' | 'incorrect' | null;

interface RugPullCardProps {
  className?: string;
  questId: number; // ID of the quest associated with this card
  xpReward: number; // XP reward for completing the quest
}


export function RugPullCard({ className, questId, xpReward }: RugPullCardProps) {
  const { toast } = useToast();
  const { addXp } = useUser(); // Get addXp function
  const [currentScenarioIndex, setCurrentScenarioIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [answerState, setAnswerState] = React.useState<AnswerState>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false); // Track overall challenge completion


  const currentScenario = scenarios[currentScenarioIndex];
  const isFinished = currentScenarioIndex >= scenarios.length;

  const handleAnswer = (isRugGuess: boolean) => {
    setShowFeedback(true);
    let currentScore = score; // Capture score before potential update
    if (isRugGuess === currentScenario.isRug) {
      setAnswerState('correct');
      setScore(prevScore => prevScore + 1);
      currentScore += 1; // Update captured score
      toast({ title: "Correct!", description: "Good eye for spotting the signs!", variant: 'default' });
    } else {
      setAnswerState('incorrect');
      toast({ title: "Incorrect", description: "Let's review the flags for this one.", variant: 'destructive' });
    }

    const nextIndex = currentScenarioIndex + 1;

    // Check if the challenge is finished after this answer
    if (nextIndex >= scenarios.length) {
        // --- Award XP on completion ---
        if (!isCompleted) { // Only award once
           const finalScore = currentScore; // Use the captured score after potential update
           const scoreThreshold = Math.ceil(scenarios.length * 0.75); // Example: 75% correct needed
           if (finalScore >= scoreThreshold) {
               addXp(xpReward);
               setIsCompleted(true); // Mark as completed visually
                // TODO: Update central quest completion state here
                 // Defer toast notification using setTimeout
                setTimeout(() => {
                   toast({
                       title: "Challenge Complete!",
                       description: `You passed and earned ${xpReward} XP! Score: ${finalScore}/${scenarios.length}`,
                       variant: "default"
                   });
                }, 0);
           } else {
                // Defer toast notification using setTimeout
                setTimeout(() => {
                   toast({
                      title: "Challenge Finished",
                      description: `You didn't reach the required score (${scoreThreshold}/${scenarios.length}). Try again! Your score: ${finalScore}/${scenarios.length}`,
                      variant: "destructive"
                   });
               }, 0);
           }
        }
         // ------------------------------
    }


    // Move to the next scenario after a delay
    setTimeout(() => {
      setCurrentScenarioIndex(nextIndex);
      setAnswerState(null);
      setShowFeedback(false);
    }, 10000); // 10 seconds delay (was 5000)
  };

   const handleRestart = () => {
        setCurrentScenarioIndex(0);
        setScore(0);
        setAnswerState(null);
        setShowFeedback(false);
        setIsCompleted(false); // Reset completion status for replay
    };


  return (
    <Card className={cn("flex flex-col", className)}>
       <CardHeader className="flex flex-row items-start justify-between">
         <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Spot the Rug Pull
            </CardTitle>
            <CardDescription>Analyze the scenario. Completes Quest ID: {questId}</CardDescription>
          </div>
           <Popover>
             <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Info size={16} />
                   <span className="sr-only">Rug Pull Info</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80"> {/* Use PopoverContent */}
                <p className="text-sm">"Rug pulls" are scams where developers abandon a project and run away with investors' funds. Learning to spot red flags (like anonymous teams, unlocked liquidity, unrealistic promises) is crucial for navigating the DeFi space safely. Always DYOR (Do Your Own Research)!</p>
              </PopoverContent>
          </Popover>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-6">
        {!isFinished && (
            <Progress value={(currentScenarioIndex / scenarios.length) * 100} className="mt-2 h-2" />
        )}
        {isFinished ? (
             <div className="text-center space-y-4 flex flex-col items-center justify-center flex-1">

                 {isCompleted ? (
                     <>
                        <Zap size={48} className="text-primary" />
                        <h3 className="text-2xl font-semibold">Challenge Passed!</h3>
                        <p className="text-muted-foreground">You scored {score} out of {scenarios.length} and earned {xpReward} XP.</p>
                         <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit">
                             <CheckSquare size={16} /> Completed
                         </Badge>
                     </>
                 ) : (
                     <>
                         <X size={48} className="text-destructive" />
                         <h3 className="text-2xl font-semibold">Challenge Finished</h3>
                         <p className="text-muted-foreground">You scored {score} out of {scenarios.length}. Need {Math.ceil(scenarios.length * 0.75)} to pass.</p>
                     </>
                 )}
                 <Button onClick={handleRestart} variant="outline">Play Again</Button>
             </div>
        ) : (
            <>
                <div>
                    <h3 className="text-lg font-semibold mb-2">{currentScenario.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{currentScenario.description}</p>

                    {showFeedback && (
                        <div className={cn(
                            "border p-3 rounded-md mb-4 text-sm",
                            answerState === 'correct' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300' : '',
                            answerState === 'incorrect' ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300' : ''
                        )}>
                            <h4 className="font-semibold mb-1">
                                {answerState === 'correct' ? 'Correct!' : 'Incorrect.'} {currentScenario.isRug ? "This looks like a potential rug pull." : "This project seems more legitimate."}
                            </h4>
                            <ul className="list-disc list-inside">
                                {(currentScenario.isRug ? currentScenario.redFlags : currentScenario.greenFlags)?.map((flag, index) => (
                                    <li key={index}>{flag}</li>
                                ))}
                            </ul>
                            <p className="mt-2 text-xs italic">Moving to next scenario soon...</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-auto pt-4 border-t">
                    <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => handleAnswer(true)}
                        disabled={showFeedback}
                    >
                        <X size={16} /> Likely Rug Pull
                    </Button>
                    <Button
                        variant="default"
                        className="flex-1 gap-2 bg-accent hover:bg-accent/90" // Use accent color
                         onClick={() => handleAnswer(false)}
                        disabled={showFeedback}
                    >
                         <Check size={16} /> Looks Safer
                    </Button>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
