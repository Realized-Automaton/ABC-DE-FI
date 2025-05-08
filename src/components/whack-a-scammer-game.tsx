
'use client';

import * as React from 'react';
import Image from 'next/image'; // Import next/image
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Removed Skull, ShieldCheck import, added Target, Timer, CheckSquare, Volume2, VolumeX
import { Target, Timer, CheckSquare, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { Badge } from '@/components/ui/badge';

const GRID_SIZE = 9; // 3x3 grid
const GAME_DURATION = 30; // seconds
const APPEAR_INTERVAL = 1000; // ms
const SCAMMER_CHANCE = 0.7; // 70% chance of being a scammer
const XP_PER_POINT = 1; // Grant 1 XP per point scored (Changed from 0.5)

// Define image URLs using direct links - Updated with new links and correct categorization
const scammerImageUrls = [
    'https://i.ibb.co/rKC8ShGq/Broccili5.png', // Broccoli5 -> Scammer
    'https://i.ibb.co/XZ5gGXzb/Sam1.png',      // Sam1 -> Scammer
    'https://i.ibb.co/xKddvTtT/Portnoy3.png', // Portnoy3 -> Scammer
    'https://i.ibb.co/9mdyMq2k/tuah4.png',      // tuah4 -> Scammer
];
const safeImageUrls = [
    'https://i.ibb.co/ymK3nQ5s/Heart6.png',     // Heart6 -> Safe
    'https://i.ibb.co/WYgcRpv/CZ2.png',        // CZ2 -> Safe
];

// Helper function to get a random element from an array
const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Updated state structure to hold image URL
type MoleData = {
    state: 'hidden' | 'scammer' | 'safe';
    imageUrl?: string; // URL of the image to display
};

interface WhackAScammerGameProps {
    className?: string;
    challengeId?: string | number; // Optional ID for tracking completion/reward context
}

export function WhackAScammerGame({ className, challengeId }: WhackAScammerGameProps) {
    const { toast } = useToast();
    const { addXp } = useUser();
    // Use the new MoleData type for state
    const [moles, setMoles] = React.useState<MoleData[]>(Array(GRID_SIZE).fill({ state: 'hidden' }));
    const [score, setScore] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [gameCompleted, setGameCompleted] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(true); // Start muted
    const finalScoreRef = React.useRef(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const moleTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const cleanupTimers = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (moleTimerRef.current) {
            clearInterval(moleTimerRef.current);
            moleTimerRef.current = null;
        }
    };

    // --- Audio Controls ---
    const playAudio = () => {
        if (audioRef.current && !isMuted) {
            audioRef.current.volume = 0.7; // Set volume
            audioRef.current.play().catch(error => console.error("Audio play failed:", error));
        }
    };

    const pauseAudio = () => {
        audioRef.current?.pause();
    };

    const toggleMute = () => {
        setIsMuted(prevMuted => {
            const newMuted = !prevMuted;
            if (audioRef.current) {
                audioRef.current.muted = newMuted;
                if (!newMuted && isPlaying) {
                    playAudio(); // Play if unmuting during game
                } else {
                    pauseAudio(); // Pause if muting
                }
            }
            return newMuted;
        });
    };
     // --------------------

    const startGame = () => {
        cleanupTimers();
        setScore(0);
        finalScoreRef.current = 0;
        setTimeLeft(GAME_DURATION);
        setIsPlaying(true);
        setGameCompleted(false);
        setMoles(Array(GRID_SIZE).fill({ state: 'hidden' })); // Reset moles state

        if (!isMuted) { // Start audio if not muted
            playAudio();
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        moleTimerRef.current = setInterval(() => {
            setIsPlaying(playing => {
                if (!playing) {
                    cleanupTimers();
                    pauseAudio(); // Stop audio when game logic stops
                    return false;
                }

                setMoles(prevMoles => {
                    const newMoles: MoleData[] = prevMoles.map(mole => ({ ...mole })); // Deep copy

                    // Hide previous mole(s) with some probability
                    newMoles.forEach((mole, i) => {
                        if (mole.state !== 'hidden' && Math.random() > 0.4) {
                            newMoles[i] = { state: 'hidden' };
                        }
                    });

                    // Show a new mole
                    const hiddenIndices = newMoles.map((mole, index) => mole.state === 'hidden' ? index : -1).filter(index => index !== -1);
                    if (hiddenIndices.length === 0) return newMoles; // No space left

                    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                    const isScammer = Math.random() < SCAMMER_CHANCE;

                    if (isScammer) {
                        newMoles[randomIndex] = { state: 'scammer', imageUrl: getRandomElement(scammerImageUrls) };
                    } else {
                        newMoles[randomIndex] = { state: 'safe', imageUrl: getRandomElement(safeImageUrls) };
                    }

                    // Occasionally show two moles
                    if (hiddenIndices.length > 1 && Math.random() < 0.2) {
                        let secondIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                        while (secondIndex === randomIndex) { // Ensure it's a different index
                            secondIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                        }
                        const secondIsScammer = Math.random() < SCAMMER_CHANCE;
                         if (secondIsScammer) {
                            newMoles[secondIndex] = { state: 'scammer', imageUrl: getRandomElement(scammerImageUrls) };
                        } else {
                            newMoles[secondIndex] = { state: 'safe', imageUrl: getRandomElement(safeImageUrls) };
                        }
                    }

                    return newMoles;
                });
                return true;
            });
        }, APPEAR_INTERVAL);
    };

    const stopGame = React.useCallback((finalScore: number) => {
        cleanupTimers();
        pauseAudio(); // Stop audio when game ends
        setIsPlaying(false);
        finalScoreRef.current = finalScore;
        setMoles(Array(GRID_SIZE).fill({ state: 'hidden' })); // Hide all moles

        // Ensure finalScore is a number before proceeding
        const scoreValue = typeof finalScore === 'number' ? finalScore : score;

        if (!gameCompleted && scoreValue > 0) {
            const earnedXp = Math.floor(scoreValue * XP_PER_POINT);
            if (earnedXp > 0) {
                addXp(earnedXp);
                 setTimeout(() => { // Defer toast
                    toast({
                        title: "Game Over!",
                        description: `Final Score: ${scoreValue}. You earned ${earnedXp} XP!`,
                        variant: "default"
                    });
                 }, 0);
                setGameCompleted(true);
            } else {
                 setTimeout(() => { // Defer toast
                     toast({ title: "Game Over!", description: `Final Score: ${scoreValue}` });
                 }, 0);
            }
        } else if (!gameCompleted) {
            setTimeout(() => { // Defer toast
                toast({ title: "Game Over!", description: `Final Score: ${scoreValue}` });
            }, 0);
        }
    }, [addXp, gameCompleted, toast, score]); // Added score to dependency array

    const handleWhack = (index: number) => {
        if (!isPlaying || moles[index].state === 'hidden') return;

        const moleType = moles[index].state;
        // Hide immediately
        setMoles(prev => {
            const newMoles = prev.map(m => ({...m})); // Deep copy
            newMoles[index] = { state: 'hidden' };
            return newMoles;
        });

        if (moleType === 'scammer') {
            setScore(prevScore => prevScore + 10);
        } else if (moleType === 'safe') {
            setScore(prevScore => Math.max(0, prevScore - 5));
            toast({ title: "Ouch!", description: "Don't hit the safe ones! (-5 points)", variant: "destructive", duration: 1500 });
        }
    };

    React.useEffect(() => {
        if (timeLeft <= 0 && isPlaying) {
            stopGame(score);
        }
    }, [timeLeft, isPlaying, score, stopGame]);

    React.useEffect(() => {
        // Initialize audio ref
        if (!audioRef.current) {
            audioRef.current = new Audio();
            // Use the new audio file URL
            audioRef.current.src = "https://audio.jukehost.co.uk/dv0ART9pPj4xB1M03ig2v0go15fuT2wo"; // <<< UPDATED LINK
            audioRef.current.loop = true;
            audioRef.current.preload = "auto";
            audioRef.current.muted = isMuted; // Set initial mute state
        }

        // Cleanup timers and audio on unmount
        return () => {
            cleanupTimers();
            pauseAudio();
            if (audioRef.current) {
                audioRef.current.src = ""; // Release audio source
                audioRef.current = null;
            }
        };
    }, [isMuted]); // Re-run if isMuted changes (although toggleMute handles it now)

    const handleGameButtonClick = () => {
        if (isPlaying) {
            stopGame(score); // Stop the game and show the current score
        } else {
            startGame(); // Start or restart the game
        }
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="text-primary" /> Whack-a-Scammer
                </CardTitle>
                {/* Updated description with larger text */}
                <CardDescription className="md:text-base"> {/* Added md:text-base */}
                    Click the scammer images, avoid the safe ones. Earn {XP_PER_POINT} XP per point.
                </CardDescription>
                {gameCompleted && !isPlaying && (
                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-2">
                        <CheckSquare size={16} /> XP Awarded
                    </Badge>
                )}
                 {/* Remove the placeholder note now */}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="flex justify-between w-full items-center mb-4 px-4">
                    <div className="text-lg font-semibold">Score: <span className="text-primary">{score}</span></div>
                    <div className="flex items-center gap-1 text-lg font-semibold">
                        <Timer size={20} /> Time: <span className={cn(timeLeft <= 10 && timeLeft > 0 && isPlaying ? "text-destructive font-bold animate-pulse" : "", timeLeft === 0 ? "text-muted-foreground" : "")}>{timeLeft}s</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full max-w-xs aspect-square bg-muted/20 p-2 rounded-lg border"> {/* Reduced gap */}
                    {moles.map((mole, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className={cn(
                                // Ensure button maintains aspect ratio and doesn't change size
                                "aspect-square h-auto w-full flex items-center justify-center transition-all duration-100 ease-out relative overflow-hidden border-2 p-0", // Use aspect-square, h-auto, reduced padding
                                "hover:bg-accent/20 active:scale-95",
                                mole.state === 'hidden' ? 'bg-card hover:bg-card/90' : 'bg-background',
                                mole.state === 'scammer' ? 'border-destructive/50 hover:bg-destructive/10' : 'border-border',
                                mole.state === 'safe' ? 'border-green-500/50 hover:bg-green-500/10' : 'border-border',
                                mole.state !== 'hidden' ? 'animate-pop-in' : '',
                                !isPlaying ? 'cursor-not-allowed opacity-70' : ''
                            )}
                            onClick={() => handleWhack(index)}
                            disabled={!isPlaying || mole.state === 'hidden'}
                            aria-label={`Mole hole ${index + 1} ${mole.state !== 'hidden' ? `- contains ${mole.state}` : '- empty'}`}
                        >
                            {mole.state !== 'hidden' && mole.imageUrl && (
                                <Image
                                    src={mole.imageUrl}
                                    alt={mole.state}
                                    layout="fill" // Use fill layout to cover the button area
                                    objectFit="contain" // Ensure image fits within bounds, doesn't stretch
                                    className="p-1" // Add some padding around the image inside the button
                                    data-ai-hint={mole.state === 'scammer' ? 'cartoon monster' : 'cartoon character'}
                                    unoptimized
                                />
                            )}
                             {/* No need for placeholder div when hidden, rely on button bg and grid size */}
                        </Button>
                    ))}
                </div>

                {/* Control buttons */}
                 <div className="flex items-center gap-4 mt-6">
                     <Button
                         onClick={handleGameButtonClick} // Use the new handler
                         size="lg"
                         variant={isPlaying ? "outline" : "default"}
                     >
                         {isPlaying ? "Stop Game" : timeLeft === GAME_DURATION ? "Start Game" : "Play Again"}
                     </Button>
                     <Button onClick={toggleMute} variant="ghost" size="icon" aria-label={isMuted ? "Unmute" : "Mute"}>
                         {isMuted ? <VolumeX /> : <Volume2 />}
                     </Button>
                 </div>
            </CardContent>
            {/* Keyframes remain the same */}
            <style jsx>{`
                 @keyframes pop-in {
                     0% { transform: translateY(100%) scale(0.8); opacity: 0; }
                     60% { transform: translateY(-10%) scale(1.1); opacity: 1; }
                     100% { transform: translateY(0%) scale(1); opacity: 1; }
                 }
                 .animate-pop-in {
                     animation: pop-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                 }
                 .animate-pulse {
                     animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                 }
                   @keyframes pulse {
                     0%, 100% {
                       opacity: 1;
                     }
                     50% {
                       opacity: .5;
                     }
                 }
             `}</style>
        </Card>
    );
}
