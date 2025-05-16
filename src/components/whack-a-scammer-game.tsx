
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Timer, CheckSquare, Volume2, VolumeX, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { Badge } from '@/components/ui/badge';

const GRID_SIZE = 9;
const GAME_DURATION = 30;
const APPEAR_INTERVAL = 1000;
const SCAMMER_CHANCE = 0.7;
const XP_PER_POINT = 1;

const scammerImageUrls = [
    'https://i.ibb.co/rKC8ShGq/Broccili5.png',
    'https://i.ibb.co/XZ5gGXzb/Sam1.png',
    'https://i.ibb.co/xKddvTtT/Portnoy3.png',
    'https://i.ibb.co/9mdyMq2k/tuah4.png',
];
const safeImageUrls = [
    'https://i.ibb.co/ymK3nQ5s/Heart6.png',
    'https://i.ibb.co/WYgcRpv/CZ2.png',
];

const RICHARD_HEART_IMAGE_URL = 'https://i.ibb.co/ymK3nQ5s/Heart6.png';
const DOOR_UNLOCK_SOUND_URL = "https://voca.ro/1dSJNoOVemlR";

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

type MoleData = {
    state: 'hidden' | 'scammer' | 'safe';
    imageUrl?: string;
};

interface WhackAScammerGameProps {
    className?: string;
    challengeId?: string | number;
}

export function WhackAScammerGame({ className, challengeId }: WhackAScammerGameProps) {
    const { toast } = useToast();
    const { addXp, username, activateEasterEgg } = useUser(); // Get activateEasterEgg from context
    const [moles, setMoles] = React.useState<MoleData[]>(Array(GRID_SIZE).fill({ state: 'hidden' }));
    const [score, setScore] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [gameCompleted, setGameCompleted] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(true);
    const finalScoreRef = React.useRef(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const moleTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const unlockAudioRef = React.useRef<HTMLAudioElement | null>(null);

    const cleanupTimers = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (moleTimerRef.current) {
            clearInterval(moleTimerRef.current);
            moleTimerRef.current = null;
        }
    }, []);

    const playAudio = React.useCallback(() => {
        if (audioRef.current && !isMuted) {
            audioRef.current.volume = 0.7;
            audioRef.current.play().catch(error => console.error("Audio play failed:", error));
        }
    }, [isMuted]);

    const pauseAudio = React.useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const toggleMute = () => {
        setIsMuted(prevMuted => !prevMuted);
    };

    const startGame = React.useCallback(() => {
        cleanupTimers();
        setScore(0);
        finalScoreRef.current = 0;
        setTimeLeft(GAME_DURATION);
        setIsPlaying(true);
        setGameCompleted(false);
        setMoles(Array(GRID_SIZE).fill({ state: 'hidden' }));

        if (!isMuted) {
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
                    pauseAudio();
                    return false;
                }

                setMoles(prevMoles => {
                    const newMoles: MoleData[] = prevMoles.map(mole => ({ ...mole }));

                    newMoles.forEach((mole, i) => {
                        if (mole.state !== 'hidden' && Math.random() > 0.4) {
                            newMoles[i] = { state: 'hidden' };
                        }
                    });

                    const hiddenIndices = newMoles.map((mole, index) => mole.state === 'hidden' ? index : -1).filter(index => index !== -1);
                    if (hiddenIndices.length === 0) return newMoles;

                    const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                    const isScammer = Math.random() < SCAMMER_CHANCE;

                    if (isScammer) {
                        newMoles[randomIndex] = { state: 'scammer', imageUrl: getRandomElement(scammerImageUrls) };
                    } else {
                        newMoles[randomIndex] = { state: 'safe', imageUrl: getRandomElement(safeImageUrls) };
                    }

                    if (hiddenIndices.length > 1 && Math.random() < 0.2) {
                        let secondIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                        while (secondIndex === randomIndex) {
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
    }, [cleanupTimers, isMuted, playAudio, pauseAudio]);

    const stopGame = React.useCallback((currentScore: number) => {
        cleanupTimers();
        pauseAudio();
        setIsPlaying(false);
        finalScoreRef.current = currentScore;
        setMoles(Array(GRID_SIZE).fill({ state: 'hidden' }));

        const scoreValue = typeof currentScore === 'number' ? currentScore : 0;

        if (!gameCompleted && scoreValue > 0) {
            const earnedXp = Math.floor(scoreValue * XP_PER_POINT);
            if (earnedXp > 0) {
                addXp(earnedXp);
                 setTimeout(() => {
                    toast({
                        title: "Game Over!",
                        description: `Final Score: ${scoreValue}. You earned ${earnedXp} XP!`,
                        variant: "default",
                        duration: 3000,
                    });
                 }, 0);
                setGameCompleted(true);
            } else {
                 setTimeout(() => {
                     toast({ title: "Game Over!", description: `Final Score: ${scoreValue}`, duration: 3000 });
                 }, 0);
            }
        } else if (!gameCompleted) {
             setTimeout(() => {
                toast({ title: "Game Over!", description: `Final Score: ${scoreValue}`, duration: 3000 });
            }, 0);
        }
    }, [addXp, gameCompleted, toast, cleanupTimers, pauseAudio]);

    // Obscured logic for a special interaction.
    // This function is intentionally less readable.
    // It checks specific conditions related to user input and game state.
    // If conditions are met, a special audio cue is played and a specific action is triggered.
    const obscureLogic = React.useCallback((moleImageUrl?: string, moleType?: string) => {
        const userAlias = username; // User's chosen alias.
        const targetVisual = RICHARD_HEART_IMAGE_URL; // A specific visual target.
        const visualType = 'safe'; // The expected type of the visual target.

        // Condition check: User alias contains 'richard' and 'heart' (case-insensitive),
        // the clicked mole's image URL matches the target visual,
        // and the mole's type matches the expected visual type.
        if (userAlias && userAlias.toLowerCase().includes('richard') && userAlias.toLowerCase().includes('heart') &&
            moleImageUrl === targetVisual && moleType === visualType) {
            
            activateEasterEgg(); // Trigger a specific in-game event or state change.

            const audioDevice = unlockAudioRef.current; // Reference to an audio element.
            // Play a special sound effect if audio is not muted.
            if (audioDevice && !isMuted) {
                audioDevice.currentTime = 0; // Reset audio to start.
                audioDevice.volume = 0.7; // Set volume.
                audioDevice.play().catch(e => console.warn("Special sound effect playback failed.", e)); // Play audio, catch errors.
            }
             // Display a subtle confirmation message.
            setTimeout(() => {
                toast({
                    title: <span className="flex items-center gap-1"><KeyRound size={18}/> Unlocked!</span>,
                    description: "", // Kept empty for subtlety
                    variant: "success",
                    duration: 3000, // Short duration
                });
            }, 0);
            return true; // Indicate that the special action was triggered.
        }
        return false; // Indicate no special action was triggered.
    }, [username, isMuted, toast, activateEasterEgg]);


    const handleWhack = (index: number) => {
        if (!isPlaying || moles[index].state === 'hidden') return;

        const moleType = moles[index].state;
        const moleImageUrl = moles[index].imageUrl;

        // Check for special action first.
        // The 'obscureLogic' function handles a specific hidden interaction.
        // If it returns true, it means the special action was triggered,
        // and we should update the mole's state to 'hidden' and then exit
        // this handler to prevent normal scoring logic.
        const specialActionTaken = obscureLogic(moleImageUrl, moleType);
        if (specialActionTaken) {
            setMoles(prev => {
                const newMoles = prev.map(m => ({...m}));
                newMoles[index] = { state: 'hidden' }; // Hide the mole.
                return newMoles;
            });
            return; // Exit early as special action has been handled.
        }
        
        // Normal whack logic if no special action was taken.
        setMoles(prev => {
            const newMoles = prev.map(m => ({...m}));
            newMoles[index] = { state: 'hidden' }; // Hide the whacked mole.
            return newMoles;
        });

        // Update score based on mole type.
        if (moleType === 'scammer') {
            setScore(prevScore => prevScore + 10); // Increase score for whacking a scammer.
        } else if (moleType === 'safe') {
            setScore(prevScore => Math.max(0, prevScore - 5)); // Decrease score for whacking a safe mole.
             // Display a toast message for whacking a safe mole.
             setTimeout(() => {
                toast({ title: "Ouch!", description: "Don't hit the safe ones! (-5 points)", variant: "destructive", duration: 1500 });
            }, 0);
        }
    };

    React.useEffect(() => {
        if (timeLeft <= 0 && isPlaying) {
            stopGame(score);
        }
    }, [timeLeft, isPlaying, score, stopGame]);

    React.useEffect(() => {
        const gameMusicElement = new Audio("https://audio.jukehost.co.uk/dv0ART9pPj4xB1M03ig2v0go15fuT2wo");
        gameMusicElement.loop = true;
        gameMusicElement.preload = "auto";
        audioRef.current = gameMusicElement;

        const unlockSoundElement = new Audio(DOOR_UNLOCK_SOUND_URL);
        unlockSoundElement.preload = "auto";
        unlockAudioRef.current = unlockSoundElement;

        return () => {
            gameMusicElement.pause();
            gameMusicElement.src = "";
            unlockSoundElement.pause();
            unlockSoundElement.src = "";
            audioRef.current = null;
            unlockAudioRef.current = null;
            cleanupTimers();
        };
    }, [cleanupTimers]);

    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
            if (isPlaying && !isMuted) {
                audioRef.current.play().catch(error => console.error("Game music play failed:", error));
            } else {
                audioRef.current.pause();
            }
        }
        if (unlockAudioRef.current) {
            unlockAudioRef.current.muted = isMuted;
        }
    }, [isMuted, isPlaying]);


    const handleGameButtonClick = () => {
        if (isPlaying) {
            stopGame(score);
        } else {
            startGame();
        }
    };

    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Target className="text-primary" /> Whack-a-Scammer
                </CardTitle>
                <CardDescription className="md:text-base">
                    Click the scammer images, avoid the safe ones. Earn {XP_PER_POINT} XP per point.
                </CardDescription>
                {gameCompleted && !isPlaying && (
                    <Badge variant="success" className="flex items-center gap-1 w-fit mt-2">
                        <CheckSquare size={16} /> XP Awarded
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="flex justify-between w-full items-center mb-4 px-4">
                    <div className="text-lg font-semibold">Score: <span className="text-primary">{score}</span></div>
                    <div className="flex items-center gap-1 text-lg font-semibold">
                        <Timer size={20} /> Time: <span className={cn(timeLeft <= 10 && timeLeft > 0 && isPlaying ? "text-destructive font-bold animate-pulse" : "", timeLeft === 0 ? "text-muted-foreground" : "")}>{timeLeft}s</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 w-full max-w-xs aspect-square bg-muted/20 p-2 rounded-lg border">
                    {moles.map((mole, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className={cn(
                                "aspect-square h-auto w-full flex items-center justify-center transition-all duration-100 ease-out relative overflow-hidden border-2 p-0",
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
                                    layout="fill"
                                    objectFit="contain"
                                    className="p-1"
                                    data-ai-hint={mole.state === 'scammer' ? 'cartoon monster' : 'cartoon character'}
                                    unoptimized
                                />
                            )}
                        </Button>
                    ))}
                </div>

                 <div className="flex items-center gap-4 mt-6">
                     <Button
                         onClick={handleGameButtonClick}
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
