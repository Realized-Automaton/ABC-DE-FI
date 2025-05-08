'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
// Added RefreshCw, Play icons. Updated User imports
import { Send, User, Bot, AlertTriangle, CheckCircle, ShieldOff, ExternalLink, Skull, MessageSquare, BellDot, Users, RefreshCw, Play } from 'lucide-react'; // Keep existing imports
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Inline SVG for Telegram Logo (Paper Plane)
const TelegramIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-5 w-5", className)} // Apply className for styling
    >
        <path d="m22 2-7 20-4-9-9-4Z"/>
        <path d="M22 2 11 13"/>
    </svg>
);


interface Message {
    sender: 'user' | 'bot' | 'system' | 'otherUser';
    text: React.ReactNode;
    timestamp: string;
    username?: string;
}

interface TelegramScamChatChallengeProps {
    className?: string;
    questId: number;
    xpReward: number;
}

const BOT_NAME = "XYZ Customer Service";
const GROUP_NAME = "XYZ Token Official Group";
const FAKE_WEBSITE = "xyz-token-support-auth.web.app";

const HELP_OPTIONS = [
    "Wallet sync isn't working.",
    "I got a transaction error.",
    "Is admin available?",
];

const PROBLEM_OPTIONS = [
    "My balance isn't updating after a swap.",
    "I keep getting 'Insufficient Funds' error.",
    "The wallet app keeps crashing.",
];

// More realistic crypto usernames
const CRYPTO_USERNAMES = [
    "CryptoKing88", "DeFiDegen", "NFTCollectorX", "WhaleWatcher", "ShillMaster",
    "DiamondHands", "MoonShotCaller", "AltcoinMaxi", "HodlerForever", "YieldFarmerPro",
    "GasSaver", "ZeroKnowledge", "ApeInStrong", "LamboDreamer", "PaperHandsPete"
];

const OTHER_USER_MESSAGES = [
    "Anyone know when staking rewards are distributed?",
    "Price looking good today!",
    "Just bought more XYZ!",
    "When moon?",
    "Is the roadmap updated?",
    "This project has potential!",
    "How do I bridge tokens?",
    "Market seems volatile...",
    "Anyone else getting this error?",
    "DYOR everyone!",
    "Feeling bullish!",
    "Need help with setting up my wallet.",
];

// Helper to get random crypto username
const getRandomCryptoUsername = (): string => CRYPTO_USERNAMES[Math.floor(Math.random() * CRYPTO_USERNAMES.length)];

export function TelegramScamChatChallenge({ className, questId, xpReward }: TelegramScamChatChallengeProps) {
    const { toast } = useToast();
    const { addXp } = useUser();
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [chatStage, setChatStage] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [isScammed, setIsScammed] = React.useState(false);
    const [showSignPrompt, setShowSignPrompt] = React.useState(false);
    const [view, setView] = React.useState<'group' | 'dm'>('group');
    const [showDmNotification, setShowDmNotification] = React.useState(false);
    const [challengeStarted, setChallengeStarted] = React.useState(false); // New state for start/reset
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const otherUserMessageIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const timeoutRefs = React.useRef<NodeJS.Timeout[]>([]); // Store all timeout IDs

    const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Helper to safely add timeouts
    const addTimeout = (callback: () => void, delay: number) => {
        const id = setTimeout(callback, delay);
        timeoutRefs.current.push(id);
        return id;
    };


    // --- Cleanup Timers ---
    const cleanupTimers = React.useCallback(() => {
        if (otherUserMessageIntervalRef.current) {
            clearInterval(otherUserMessageIntervalRef.current);
            otherUserMessageIntervalRef.current = null;
        }
        timeoutRefs.current.forEach(clearTimeout); // Clear all stored timeouts
        timeoutRefs.current = []; // Reset the array
    }, []); // No dependencies needed


    const addMessage = (sender: Message['sender'], text: React.ReactNode, username?: string) => {
        setMessages(prev => [...prev, { sender, text, timestamp: formatTime(), username }]);
    };

    // --- Adds random messages from other users ---
    const addOtherUserMessage = React.useCallback(() => {
        // Only add if in group view and challenge started and not finished
        if (view === 'group' && challengeStarted && !isCompleted && !isScammed) {
            const randomUsername = getRandomCryptoUsername(); // Use new username function
            const randomMessage = OTHER_USER_MESSAGES[Math.floor(Math.random() * OTHER_USER_MESSAGES.length)];
            addMessage('otherUser', randomMessage, randomUsername);
        }
    }, [view, challengeStarted, isCompleted, isScammed]); // Dependencies


    // --- Initializes the chat when started ---
     const initializeChat = React.useCallback(() => {
        cleanupTimers(); // Clear any existing timers first
        setMessages([]); // Clear previous messages
        addMessage('system', <>You joined <span className='font-semibold'>{GROUP_NAME}</span>. Choose an option below if you need help.</>);

        // Start adding other user messages only if in group view and challenge is active
        if (view === 'group' && challengeStarted && !isCompleted && !isScammed) {
             // Add initial messages immediately
             addTimeout(() => addOtherUserMessage(), 500); // Add first message quickly
             addTimeout(() => addOtherUserMessage(), 1500); // Add second message soon after

             // Start the interval for subsequent messages AFTER the initial ones
             if (!otherUserMessageIntervalRef.current) {
                 otherUserMessageIntervalRef.current = setInterval(addOtherUserMessage, 6000); // Start interval after 2s
             }
         }
        setChatStage(1); // Ready for user help request
    }, [cleanupTimers, view, addOtherUserMessage, challengeStarted, isCompleted, isScammed]); // Added dependencies


    // --- Handles starting the challenge ---
    const handleStartChallenge = () => {
        setChallengeStarted(true);
        setIsCompleted(false);
        setIsScammed(false);
        setShowDmNotification(false);
        setView('group'); // Start in group view
        initializeChat(); // Initialize chat, which now includes starting the interval
    };

    // --- Handles resetting the challenge ---
    const handleResetChallenge = () => {
        cleanupTimers();
        setChallengeStarted(false);
        setMessages([]);
        setChatStage(0);
        setIsCompleted(false);
        setIsScammed(false);
        setShowDmNotification(false);
        setView('group');
        setIsLoading(false);
        setShowSignPrompt(false);
    };

    // --- Scroll to Bottom ---
    React.useEffect(() => {
        if (scrollAreaRef.current) {
            // Slight delay to allow DOM updates before scrolling
            addTimeout(() => {
                 if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
                 }
             }, 50);
        }
        // Cleanup timeouts added by this effect if messages change rapidly
        return () => {
            // This might be too aggressive depending on usage, but ensures cleanup
            // Consider if timeouts added here specifically need cleanup on message change
        };
    }, [messages]);

    // --- Game Logic Effects ---
    React.useEffect(() => {
        // This effect handles game progression based on stage and view
        if (!challengeStarted) return; // Don't run logic if challenge hasn't started

        let stageTimer: NodeJS.Timeout | undefined;

        // --- Bot Sees Help Request (Stage 2) ---
        if (chatStage === 2 && view === 'group') {
            stageTimer = addTimeout(() => {
                setShowDmNotification(true); // Make DM entry appear with notification
            }, 2000);
        }
        // --- Bot Sends First DM (Stage 4) ---
         else if (chatStage === 4 && view === 'dm') {
            setIsLoading(true);
            stageTimer = addTimeout(() => {
                 addMessage('bot', `Hello! I'm from ${BOT_NAME}. I saw your message in the group. How can I help you with your wallet issue today? Please select an option below.`);
                setIsLoading(false);
                setChatStage(5); // Ready for user to select problem option
            }, 1000);
        }
        // --- Bot Sends Scam Link (Stage 6) ---
        else if (chatStage === 6 && view === 'dm') {
            setIsLoading(true);
            stageTimer = addTimeout(() => {
                addMessage('bot', <>Okay, I see. Please visit our secure wallet synchronization portal to resolve this: <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(); }} className="text-blue-500 dark:text-blue-400 underline break-all font-semibold hover:text-blue-600 dark:hover:text-blue-300">{FAKE_WEBSITE} <ExternalLink size={12} className="inline-block ml-1"/></a> <br/><br/> <span className='text-xs text-muted-foreground'>Make sure to connect your wallet and sign the transaction to re-sync.</span></>); // Changed link color
                setIsLoading(false);
                setChatStage(7); // Decision point
            }, 2500);
        }

        // General cleanup for timers set in this effect
        return () => {
            if (stageTimer) {
                clearTimeout(stageTimer);
                // Remove from ref array if needed, though cleanupTimers handles it globally
            }
        };

    }, [chatStage, view, challengeStarted]); // Dependencies remain the same


    // --- Handles clicking predefined help options in group view ---
    const handleHelpRequest = (optionText: string) => {
        if (chatStage === 1 && view === 'group' && challengeStarted) {
            addMessage('user', optionText);
            setChatStage(2); // Bot will "notice" and initiate DM process
        }
    };

     // --- Handles User Selecting a Problem Description in DM ---
     const handleProblemSelection = (problemText: string) => {
        if (chatStage === 5 && view === 'dm' && challengeStarted) {
            addMessage('user', problemText);
            setChatStage(6); // Trigger bot sending scam link
        }
    };

    // --- Handles Switching View ---
     const switchView = (newView: 'group' | 'dm') => {
        if (!challengeStarted || view === newView) return; // No change if not started or same view

        if (newView === 'dm' && chatStage < 2) return; // Don't allow switch if DM not initiated

        setView(newView);
        setMessages([]); // Clear messages when switching contexts
        setIsLoading(false);

        if (newView === 'group') {
            cleanupTimers(); // Stop potential DM timers/loading
            addMessage('system', <>You are now viewing <span className='font-semibold'>{GROUP_NAME}</span>.</>);
             // Restart interval for group messages if not completed/scammed
             // And ensure it's not already running
             if (!otherUserMessageIntervalRef.current && !isCompleted && !isScammed && challengeStarted) {
                  addTimeout(() => addOtherUserMessage(), 500); // Add one quickly on switch back
                  otherUserMessageIntervalRef.current = setInterval(addOtherUserMessage, 6000);
             }
        } else { // Switching to DM
             cleanupTimers(); // Stop group messages interval
            setShowDmNotification(false); // Acknowledge DM by clicking
             addMessage('system', <>You are now in a direct message with <span className='font-semibold'>{BOT_NAME}</span>.</>);
            if (chatStage === 2 || chatStage === 3) {
                setChatStage(4); // Trigger bot's first message
            } else if (chatStage > 3) {
                // If already in later stages of DM, replay relevant bot messages?
                // Or just show current state? For simplicity, just show current state.
                // If stage 5, show problem options again? Maybe not needed.
                 if (chatStage === 6 || chatStage === 7) {
                     // Re-add the scam link message if returning to DM at that stage
                     addTimeout(() => {
                          addMessage('bot', <>Okay, I see. Please visit our secure wallet synchronization portal to resolve this: <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick(); }} className="text-blue-500 dark:text-blue-400 underline break-all font-semibold hover:text-blue-600 dark:hover:text-blue-300">{FAKE_WEBSITE} <ExternalLink size={12} className="inline-block ml-1"/></a> <br/><br/> <span className='text-xs text-muted-foreground'>Make sure to connect your wallet and sign the transaction to re-sync.</span></>); // Changed link color
                     }, 500); // Small delay
                 }
            }
        }
    };

    const handleLinkClick = () => {
        if (view === 'dm' && chatStage === 7 && challengeStarted) {
            setShowSignPrompt(true);
        }
    };

    const handleIdentifyScam = () => {
        if (chatStage < 8 && view === 'dm' && challengeStarted) {
            setChatStage(8);
            setIsCompleted(true);
            cleanupTimers(); // Stop any remaining timers
            addXp(xpReward);
            addMessage('system', <span className="text-green-600 dark:text-green-400 font-medium">Good job! You correctly identified this as a scam. Support will NEVER DM you first or ask you to connect your wallet to a random site.</span>);
            addTimeout(() => {
                toast({
                    title: "Scam Spotted! ✅",
                    description: `You earned ${xpReward} XP. Remember: Real support rarely DMs first and avoids suspicious links!`,
                    variant: "success",
                    duration: 7000,
                });
            }, 0);
        }
    };

    const handleConfirmSign = () => {
        if (chatStage < 8 && view === 'dm' && challengeStarted) {
            setChatStage(9);
            setIsScammed(true);
            cleanupTimers(); // Stop any remaining timers
            addMessage('system', <span className='text-destructive font-medium'>You signed the transaction! The scammer drained 10,000 XYZ tokens from your wallet. Always verify URLs and transaction details carefully.</span>);
            addTimeout(() => {
                toast({
                    title: <>Uh Oh! Wallet Drained! <Skull className="inline-block h-4 w-4 ml-1" /></>,
                    description: "You fell for the scam! This simulation cost you 10,000 fake XYZ tokens. Learn from this!",
                    variant: "destructive",
                    duration: 10000,
                });
            }, 0);
        }
    };

     // Cleanup interval on component unmount
     React.useEffect(() => {
        return cleanupTimers;
     }, [cleanupTimers]);

     // Ensure interval starts correctly when challenge starts and view is group
     React.useEffect(() => {
        if (challengeStarted && view === 'group' && !isCompleted && !isScammed && !otherUserMessageIntervalRef.current) {
            addTimeout(() => addOtherUserMessage(), 500);
            addTimeout(() => addOtherUserMessage(), 1500);
            otherUserMessageIntervalRef.current = setInterval(addOtherUserMessage, 6000);
        } else if ((!challengeStarted || view !== 'group' || isCompleted || isScammed) && otherUserMessageIntervalRef.current) {
            // Clear interval if conditions are not met
            cleanupTimers();
        }
     }, [challengeStarted, view, isCompleted, isScammed, addOtherUserMessage, cleanupTimers]);


    return (
        <Card className={cn(
             "flex flex-col h-[600px] max-h-[80vh] overflow-hidden",
             // Mimic Telegram dark theme colors - adjust HSL values if needed
             "dark:bg-[#17212b] dark:text-[#c5d0db] dark:border-[#0f1923]",
             className
         )}>
             {/* Card Header */}
            <CardHeader className={cn(
                 "pb-2 pt-4 px-4",
                 "dark:border-b dark:border-[#0f1923]" // Dark mode border
             )}>
                 <div className="flex justify-between items-start">
                     <div>
                         <CardTitle className="flex items-center gap-2 text-lg">
                           {/* Use the TelegramIcon SVG component */}
                           <TelegramIcon className="text-primary dark:text-blue-400" /> Telegram Support Scam
                         </CardTitle>
                        <CardDescription className="text-xs dark:text-gray-500">Identify the scammer in the DMs. | Quest ID: {questId}</CardDescription>
                         {challengeStarted && (isCompleted || isScammed) && ( // Show status only if started
                             <Badge variant={isCompleted ? "success" : "destructive"} className="w-fit mt-1 text-xs px-1.5 py-0.5">
                                {isCompleted ? <CheckCircle size={12} className="mr-1"/> : <ShieldOff size={12} className="mr-1"/>}
                                {isCompleted ? `Completed (+${xpReward} XP)` : "Failed"}
                            </Badge>
                         )}
                    </div>
                     {/* Reset Button */}
                     {challengeStarted && (
                         <Button variant="outline" size="sm" onClick={handleResetChallenge} className="gap-1 text-xs dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700">
                           <RefreshCw size={14} /> Reset
                         </Button>
                     )}
                 </div>
            </CardHeader>

             {/* Main Content Area */}
             <CardContent className="flex-1 flex p-0 overflow-hidden">
                 {!challengeStarted ? (
                    // Show Start Button if challenge hasn't started
                    <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                         <Bot size={48} className="text-muted-foreground dark:text-gray-600"/>
                         <p className="text-muted-foreground dark:text-gray-500 text-center">Ready to test your scam-spotting skills in a simulated Telegram chat?</p>
                         <Button onClick={handleStartChallenge} size="lg" className="gap-2 dark:bg-blue-600 dark:hover:bg-blue-700">
                             <Play size={18}/> Start Challenge
                         </Button>
                    </div>
                 ) : (
                     // Show Chat Interface if challenge has started
                     <>
                         {/* Left Pane (Chat List) */}
                         <div className={cn(
                              "w-1/3 md:w-1/4 border-r p-2 overflow-y-auto flex flex-col space-y-1",
                              "dark:bg-[#0f1923] dark:border-[#17212b]" // Dark mode chat list bg and border
                          )}>
                             <h3 className="text-sm font-semibold mb-2 px-1 dark:text-gray-400">Chats</h3>
                             {/* Group Chat Entry */}
                             <button
                                 onClick={() => switchView('group')}
                                 className={cn(
                                     "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
                                     view === 'group' ? 'font-medium bg-blue-500/20 dark:bg-blue-600/30' : 'hover:bg-muted/50 dark:hover:bg-gray-700/50',
                                     (isCompleted || isScammed) && "opacity-60 cursor-not-allowed"
                                 )}
                                 disabled={isCompleted || isScammed}
                             >
                                 <Avatar className="h-8 w-8">
                                     <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"><Users size={16}/></AvatarFallback>
                                 </Avatar>
                                 <span className="flex-1 text-sm truncate dark:text-gray-300">{GROUP_NAME}</span>
                             </button>

                              {/* DM Chat Entry */}
                             {(chatStage >= 2 || isScammed || isCompleted) && (
                                 <button
                                     onClick={() => switchView('dm')}
                                     className={cn(
                                         "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors relative",
                                         view === 'dm' ? 'font-medium bg-blue-500/20 dark:bg-blue-600/30' : 'hover:bg-muted/50 dark:hover:bg-gray-700/50',
                                         (isCompleted || isScammed) && "opacity-60 cursor-not-allowed"
                                     )}
                                     disabled={isCompleted || isScammed}
                                 >
                                     <Avatar className="h-8 w-8">
                                         <AvatarFallback className="bg-red-300 dark:bg-red-700 text-red-800 dark:text-red-200"><Bot size={16}/></AvatarFallback>
                                     </Avatar>
                                     <span className="flex-1 text-sm truncate dark:text-gray-300">{BOT_NAME}</span>
                                      {/* DM Notification Badge */}
                                      {showDmNotification && (
                                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold dark:bg-blue-500 dark:text-white">
                                               1
                                          </span>
                                      )}
                                 </button>
                             )}
                         </div>

                         {/* Right Pane (Chat Area & Input) */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Chat Messages */}
                            <ScrollArea className="flex-1 p-4 bg-background dark:bg-[#17212b]" ref={scrollAreaRef}>
                                <div className="space-y-2"> {/* Reduced space between messages */}
                                     {/* System message indicating current view */}
                                     <div className="text-center text-xs text-muted-foreground dark:text-gray-500 italic my-2">
                                        {view === 'group' ? `Viewing ${GROUP_NAME}` : `Viewing DM with ${BOT_NAME}`}
                                    </div>


                                     {messages.map((msg, index) => (
                                        <div
                                            key={`${view}-${index}-${msg.timestamp}-${msg.sender}-${msg.username || ''}`} // More robust key
                                            className={cn(
                                                "flex items-end gap-2 max-w-[85%] w-fit", // Added w-fit
                                                msg.sender === 'user' && "ml-auto flex-row-reverse",
                                                msg.sender === 'system' && "justify-center text-center text-xs text-muted-foreground italic my-2 !max-w-full", // System messages centered, full width
                                                msg.sender === 'otherUser' && "mr-auto" // Align other users left
                                            )}
                                        >
                                             {/* Avatar for Bot and Other Users (aligned left) */}
                                             {['bot', 'otherUser'].includes(msg.sender) && (
                                                <Avatar className="h-6 w-6 border flex-shrink-0 self-start mt-1"> {/* Smaller avatar, aligned top */}
                                                     <AvatarFallback className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                                         {msg.sender === 'bot' ? <Bot size={12} /> : msg.username?.charAt(0).toUpperCase() ?? <User size={12}/>}
                                                     </AvatarFallback>
                                                </Avatar>
                                             )}
                                             {/* Message Bubble */}
                                            {msg.sender !== 'system' && (
                                                <div className={cn(
                                                     "rounded-lg px-3 py-1.5 text-sm shadow-sm break-words relative", // Added relative for timestamp
                                                     msg.sender === 'user' ? "bg-blue-500 dark:bg-blue-700 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100", // Mimic Telegram bubble colors
                                                     ['bot', 'otherUser'].includes(msg.sender) ? "" : "" // Remove border
                                                 )}>
                                                     {/* Username for Bot/Other Users */}
                                                      {msg.sender === 'bot' && <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-0.5">{BOT_NAME}</p>}
                                                      {msg.sender === 'otherUser' && <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-0.5">{msg.username}</p>}

                                                    {/* Message Text */}
                                                    <p className="pr-10">{msg.text}</p> {/* Add padding for timestamp */}
                                                    {/* Timestamp inside bubble */}
                                                    <span className="absolute bottom-1 right-2 text-xs opacity-60">{msg.timestamp}</span>
                                                </div>
                                            )}
                                             {/* System Message Text */}
                                            {msg.sender === 'system' && <p>{msg.text}</p>}
                                            {/* Avatar for User (aligned right) */}
                                            {msg.sender === 'user' && (
                                                <Avatar className="h-6 w-6 border flex-shrink-0 self-start mt-1"> {/* Smaller avatar, aligned top */}
                                                     <AvatarFallback className="text-xs bg-green-300 dark:bg-green-700 text-green-800 dark:text-green-200"><User size={12}/></AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                    {/* Loading Indicator */}
                                     {isLoading && view === 'dm' && (
                                        <div className="flex items-end gap-2 max-w-[85%] w-fit">
                                             <Avatar className="h-6 w-6 border flex-shrink-0 self-start mt-1">
                                                 <AvatarFallback className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"><Bot size={12} /></AvatarFallback>
                                             </Avatar>
                                            <div className="rounded-lg px-3 py-1.5 text-sm shadow-sm bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 relative">
                                                 <p className="text-xs font-semibold text-red-500 dark:text-red-400 mb-0.5">{BOT_NAME}</p>
                                                <div className="flex items-center space-x-1 pr-10">
                                                    <span className="h-1.5 w-1.5 bg-muted-foreground dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                    <span className="h-1.5 w-1.5 bg-muted-foreground dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="h-1.5 w-1.5 bg-muted-foreground dark:bg-gray-400 rounded-full animate-bounce"></span>
                                                </div>
                                                 <span className="absolute bottom-1 right-2 text-xs opacity-60">{formatTime()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                             {/* Input/Action Area at the Bottom */}
                             <div className={cn(
                                  "p-4 border-t",
                                  "dark:bg-[#0f1923] dark:border-[#17212b]" // Dark input area
                              )}>
                                 {/* Group View - Help Options */}
                                 {view === 'group' && chatStage === 1 && !isCompleted && !isScammed && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {HELP_OPTIONS.map((option, i) => (
                                            <Button key={i} variant="outline" size="sm" onClick={() => handleHelpRequest(option)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                                                {option}
                                            </Button>
                                        ))}
                                    </div>
                                 )}
                                 {/* DM View - Problem Options */}
                                  {view === 'dm' && chatStage === 5 && !isCompleted && !isScammed && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                          {PROBLEM_OPTIONS.map((option, i) => (
                                              <Button key={i} variant="outline" size="sm" onClick={() => handleProblemSelection(option)} disabled={isLoading} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                                                  {option}
                                              </Button>
                                          ))}
                                      </div>
                                  )}
                                 {/* DM View - Decision Buttons */}
                                 {view === 'dm' && chatStage === 7 && !isCompleted && !isScammed && (
                                     <div className="bg-yellow-100 dark:bg-yellow-900/30 text-center p-3 rounded-md border border-yellow-300 dark:border-yellow-700">
                                         <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2 flex items-center justify-center gap-1"><AlertTriangle size={16}/>Decision Point</p>
                                         <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">What do you do with the link provided?</p>
                                         <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                             <Button variant="destructive" size="sm" onClick={handleIdentifyScam} className="flex-1">
                                                 <ShieldOff size={16} className="mr-1"/> Identify as Scam
                                             </Button>
                                             <Button variant="default" size="sm" onClick={handleLinkClick} className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700">
                                                 <ExternalLink size={16} className="mr-1"/> Visit Website
                                             </Button>
                                         </div>
                                     </div>
                                 )}
                                 {/* Game Over Message */}
                                 {(isCompleted || isScammed) && (
                                      <div className="text-center text-sm text-muted-foreground dark:text-gray-500">
                                        Challenge {isCompleted ? 'Completed' : 'Failed'}. Use Reset to play again.
                                      </div>
                                 )}
                                  {/* Placeholder for when no actions are available */}
                                  {view === 'group' && chatStage !== 1 && !isCompleted && !isScammed && !isLoading && (
                                    <p className="text-xs text-muted-foreground dark:text-gray-500 text-center italic">Waiting for interaction or DM...</p>
                                 )}
                                  {view === 'dm' && ![5, 7].includes(chatStage) && !isCompleted && !isScammed && !isLoading && (
                                     <p className="text-xs text-muted-foreground dark:text-gray-500 text-center italic">Waiting for bot response or decision...</p>
                                 )}
                             </div>
                         </div>
                    </>
                 )}
             </CardContent>

            {/* Fake Signing Prompt Modal */}
             <AlertDialog open={showSignPrompt} onOpenChange={setShowSignPrompt}>
              <AlertDialogContent className="border-destructive border-2 shadow-lg shadow-destructive/30 dark:bg-gray-800 dark:border-red-600 dark:text-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 dark:text-red-400"><AlertTriangle className="text-destructive dark:text-red-400" /> Transaction Approval Request</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-gray-400">
                    The website <span className="font-semibold text-primary dark:text-blue-400">{FAKE_WEBSITE}</span> is requesting permission to interact with your wallet.
                    <div className="mt-3 p-3 border rounded-md bg-muted/50 text-sm space-y-1 dark:bg-gray-700/50 dark:border-gray-600">
                        {/* Replaced nested <p> tags with <div> */}
                        <div><span className="font-semibold dark:text-gray-300">Action:</span> Approve Token Transfer</div>
                        <div><span className="font-semibold dark:text-gray-300">Token:</span> XYZ Token</div>
                        <div><span className="font-semibold text-destructive dark:text-red-400">Amount:</span> 10,000 XYZ <span className="text-xs italic">(High Amount!)</span></div>
                        <div><span className="font-semibold dark:text-gray-300">Recipient:</span> 0xScAm...Addr3ss</div>
                        <div className="text-xs mt-2 text-destructive font-medium dark:text-red-400">Warning: Carefully review the details before signing. Approving this could lead to loss of funds.</div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {setShowSignPrompt(false); handleIdentifyScam(); }} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                      <ShieldOff size={16} className="mr-1"/> Reject (It's a Scam!)
                  </AlertDialogCancel>
                   <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                        onClick={() => {setShowSignPrompt(false); handleConfirmSign(); }}>
                        <Skull size={16} className="mr-1"/> Approve Transaction
                    </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* Keyframes for animations */}
            <style jsx>{`
                 @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
                 .animate-bounce { animation: bounce 1s infinite; }
            `}</style>
        </Card>
    );
}
