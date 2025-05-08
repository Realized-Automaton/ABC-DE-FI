'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, RefreshCw, HelpCircle, CheckSquare, Shuffle } from 'lucide-react'; // Added Shuffle icon
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context'; // Import useUser
import { Badge } from '@/components/ui/badge'; // Import Badge

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard'; // Add difficulty
}

// Original questions array
const originalQuizQuestions: QuizQuestion[] = [
    {
        id: 1,
        question: "What does 'DYOR' stand for in crypto?",
        options: ["Do Your Own Research", "Don't Yield Our Resources", "Deposit Your Own Ratio", "Data Yield Optimization Rate"],
        correctAnswer: "Do Your Own Research",
        explanation: "DYOR emphasizes the importance of investigating a project yourself before investing.",
        difficulty: 'easy',
    },
    {
        id: 2,
        question: "Which of these is a common red flag for a potential 'rug pull' scam?",
        options: ["Team is publicly known (doxxed)", "Liquidity locked for a long period", "Anonymous team and very short liquidity lock", "Project has a clear whitepaper"],
        correctAnswer: "Anonymous team and very short liquidity lock",
        explanation: "Scammers often stay anonymous and lock liquidity only briefly (or not at all) so they can withdraw funds easily.",
        difficulty: 'medium',
    },
    {
        id: 3,
        question: "What is 'gas' in the context of Ethereum?",
        options: ["A type of token", "The fee required to perform transactions", "A stablecoin", "The energy used for mining"],
        correctAnswer: "The fee required to perform transactions",
        explanation: "Gas fees compensate miners/validators for the computational effort needed to process transactions on the network.",
        difficulty: 'easy',
    },
     {
        id: 4,
        question: "What is the primary purpose of a 'faucet' in crypto tutorials?",
        options: ["To exchange real money for crypto", "To provide small amounts of free test tokens", "To secure your private keys", "To track market prices"],
        correctAnswer: "To provide small amounts of free test tokens",
        explanation: "Faucets allow users to get no-value tokens on testnets or specific platforms to practice transactions without risking real money.",
        difficulty: 'easy',
    },
     {
        id: 5,
        question: "A 'honeypot' smart contract typically...",
        options: ["Rewards users for holding tokens", "Allows anyone to withdraw funds", "Prevents buyers from selling their tokens", "Automatically increases token price"],
        correctAnswer: "Prevents buyers from selling their tokens",
        explanation: "Honeypot contracts trap users' funds by including code that allows buying but restricts or prevents selling.",
        difficulty: 'hard',
    },
    { // New Question (ID 6)
        id: 6,
        question: "When is it ok to share your wallet keys (seed phrase or private key)?",
        options: [
            "When customer support asks for it to verify your identity.",
            "To receive an airdrop or special reward.",
            "If a trusted friend needs to borrow funds quickly.",
            "NEVER. Sharing your keys gives full control of your funds.",
        ],
        correctAnswer: "NEVER. Sharing your keys gives full control of your funds.",
        explanation: "Your private keys/seed phrase grant complete access to your wallet. NEVER share them with anyone, including support, friends, or websites asking for verification.",
        difficulty: 'hard',
    },
];

// Fisher-Yates (Knuth) Shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const shuffledArray = [...array]; // Create a copy

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex], shuffledArray[currentIndex]];
  }
  return shuffledArray;
};


// Calculate XP based on difficulty
const calculateXpReward = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
        case 'easy': return 5;
        case 'medium': return 10;
        case 'hard': return 15;
        default: return 5;
    }
};

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

interface CryptoQuizProps {
  className?: string;
  challengeId?: string | number; // Optional ID for tracking completion/reward context
}


export function CryptoQuiz({ className, challengeId }: CryptoQuizProps) {
    const { toast } = useToast();
    const { addXp } = useUser(); // Get addXp function
    // State to hold the shuffled questions for the current quiz instance
    const [quizQuestions, setQuizQuestions] = React.useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = React.useState<AnswerStatus>('unanswered');
    const [score, setScore] = React.useState(0);
    const [earnedXp, setEarnedXp] = React.useState(0); // Track XP earned per question
    const [totalEarnedXp, setTotalEarnedXp] = React.useState(0); // Track total XP for the quiz
    const [showExplanation, setShowExplanation] = React.useState(false);
    const [isQuizFinished, setIsQuizFinished] = React.useState(false);
    const [quizCompleted, setQuizCompleted] = React.useState(false); // Track if XP has been awarded

    // Shuffle questions when the component mounts for the first time
    React.useEffect(() => {
        setQuizQuestions(shuffleArray(originalQuizQuestions));
    }, []);


    // Ensure currentQuestion doesn't error if quizQuestions is initially empty
    const currentQuestion = quizQuestions.length > 0 ? quizQuestions[currentQuestionIndex] : null;

    const handleSubmitAnswer = () => {
        if (!selectedAnswer || !currentQuestion) { // Add null check for currentQuestion
            toast({ title: "Please select an answer.", variant: "destructive" });
            return;
        }

        setShowExplanation(true);
        if (selectedAnswer === currentQuestion.correctAnswer) {
            const xpForQuestion = calculateXpReward(currentQuestion.difficulty);
            setAnswerStatus('correct');
            setScore(prevScore => prevScore + 1);
            setEarnedXp(xpForQuestion); // Show XP for this question
            setTotalEarnedXp(prevTotal => prevTotal + xpForQuestion); // Add to total
        } else {
            setAnswerStatus('incorrect');
            setEarnedXp(0); // No XP for incorrect answer
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setAnswerStatus('unanswered');
            setShowExplanation(false);
            setEarnedXp(0); // Reset XP display for next question
        } else {
            setIsQuizFinished(true);
            // --- Award total XP on finish ---
             if (!quizCompleted && totalEarnedXp > 0) { // Award only once and if XP earned
                 addXp(totalEarnedXp);
                 setQuizCompleted(true); // Mark XP as awarded
                  setTimeout(() => { // Defer toast
                      toast({
                         title: "Quiz Complete!",
                         description: `Final Score: ${score}/${quizQuestions.length}. You earned ${totalEarnedXp} XP!`,
                         variant: "success" // Use success variant
                     });
                 }, 0);
             } else {
                 // If already completed or no XP earned, just show score
                  setTimeout(() => { // Defer toast
                      toast({
                         title: quizCompleted ? "Quiz Finished!" : "Quiz Complete!",
                         description: `Final Score: ${score}/${quizQuestions.length}.${quizCompleted ? "" : " No XP earned this time."}`,
                         variant: quizCompleted ? "default" : "destructive"
                     });
                  }, 0);
             }
            // -------------------------------
        }
    };

     const handleRestartQuiz = () => {
        setQuizQuestions(shuffleArray(originalQuizQuestions)); // Re-shuffle questions
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswerStatus('unanswered');
        setScore(0);
        setEarnedXp(0);
        setTotalEarnedXp(0);
        setShowExplanation(false);
        setIsQuizFinished(false);
        setQuizCompleted(false); // Allow XP reward on restart
        setTimeout(() => { // Defer toast
             toast({ title: "Quiz Restarted", description: "Questions have been shuffled!", icon: <Shuffle size={16}/> });
        }, 0);
    };

    // Handle case where currentQuestion might be null briefly
    if (!currentQuestion) {
        return (
            <Card className={cn("flex flex-col items-center justify-center", className)}>
                <CardHeader>
                    <CardTitle>Loading Quiz...</CardTitle>
                </CardHeader>
                <CardContent>
                    <RefreshCw className="animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }


    return (
        <Card className={cn("flex flex-col", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="text-primary" /> Crypto Knowledge Quiz
                </CardTitle>
                 {/* Increased font size for CardDescription */}
                <CardDescription className="md:text-base">
                    Test your understanding of common crypto concepts and risks.
                </CardDescription>
                 {quizCompleted && !isQuizFinished && ( /* Show completed badge if playing again */
                     <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit mt-2">
                         <CheckSquare size={16} /> Completed Once
                     </Badge>
                 )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                {isQuizFinished ? (
                    <div className="text-center space-y-4 flex flex-col items-center justify-center flex-1">
                        <CheckCircle size={48} className="text-accent" />
                        <h3 className="text-2xl font-semibold">Quiz Finished!</h3>
                        <p className="text-muted-foreground">You scored {score} out of {quizQuestions.length}.</p>
                         <p className="text-primary font-medium">Total XP Earned: {totalEarnedXp}</p>
                         {quizCompleted && totalEarnedXp > 0 && (
                             <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 w-fit">
                                 <CheckSquare size={16} /> XP Awarded
                             </Badge>
                          )}
                         {totalEarnedXp === 0 && !quizCompleted && (
                              <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                 <XCircle size={16} /> No XP Earned
                             </Badge>
                         )}
                        <Button onClick={handleRestartQuiz} variant="outline" className="gap-2">
                            <RefreshCw size={16} /> Restart Quiz
                        </Button>
                    </div>
                ) : (
                    <>
                        <div>
                             <div className="flex justify-between items-baseline mb-4">
                                <p className="font-medium">
                                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                                </p>
                                <Badge variant="outline" className="capitalize text-xs">{currentQuestion.difficulty}</Badge>
                             </div>

                            <p className="font-medium mb-4"> {currentQuestion.question}</p>

                            <RadioGroup
                                value={selectedAnswer ?? undefined}
                                onValueChange={setSelectedAnswer}
                                className="space-y-2"
                                disabled={answerStatus !== 'unanswered'}
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`option-${challengeId}-${currentQuestion.id}-${index}`} /> {/* Unique ID using question ID */}
                                        <Label
                                            htmlFor={`option-${challengeId}-${currentQuestion.id}-${index}`} // Unique ID
                                            className={cn(
                                                "cursor-pointer",
                                                answerStatus !== 'unanswered' && option === currentQuestion.correctAnswer ? 'text-green-600 dark:text-green-400 font-semibold' : '',
                                                answerStatus === 'incorrect' && selectedAnswer === option ? 'text-red-600 dark:text-red-500 line-through' : ''
                                            )}
                                        >
                                            {option}
                                        </Label>
                                         {answerStatus === 'correct' && selectedAnswer === option && <CheckCircle className="text-green-500 ml-auto" size={16}/>}
                                         {answerStatus === 'incorrect' && selectedAnswer === option && <XCircle className="text-red-500 ml-auto" size={16}/>}
                                         {answerStatus === 'incorrect' && option === currentQuestion.correctAnswer && <CheckCircle className="text-green-500 ml-auto" size={16}/>}

                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                         {showExplanation && (
                            <div className={cn(
                                "border p-3 rounded-md text-sm mt-4",
                                answerStatus === 'correct' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300' : '',
                                answerStatus === 'incorrect' ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300' : ''
                            )}>
                                <p className="font-semibold mb-1">{answerStatus === 'correct' ? `Correct! (+${earnedXp} XP)` : 'Incorrect.'}</p>
                                <p>{currentQuestion.explanation}</p>
                            </div>
                        )}


                        <div className="mt-auto pt-4 border-t">
                            {answerStatus === 'unanswered' ? (
                                <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="w-full">Submit Answer</Button>
                            ) : (
                                <Button onClick={handleNextQuestion} className="w-full">
                                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
