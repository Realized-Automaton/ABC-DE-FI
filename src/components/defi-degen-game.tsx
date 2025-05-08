
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, DollarSign, TrendingUp, TrendingDown, Play, RefreshCw, Send, LineChart as LineChartIcon, Info, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


interface DeFiDegenGameProps {
    className?: string;
    questId: number;
    xpReward: number;
}

// --- Game Data Types ---
type TokenSymbol = 'GARBAGE' | 'CLOWN' | 'SAFE' | 'XYZ';

// Add an 'id' field to GameEvent for tracking uniqueness
interface GameEvent {
    id: number; // Unique identifier for the event
    type: 'rumor' | 'tweet' | 'marketShift' | 'scamOpportunity' | 'news' | 'nftOpportunity' | 'daoDrama' | 'exploit' | 'utilityLaunch' | 'microcap';
    title: string;
    description: string;
    token?: TokenSymbol;
    potentialGain?: string;
    actionOptions?: string[];
    sentimentEffect?: GameState['marketSentiment'];
    isHighRisk?: boolean;
    subtleClue?: string;
    delayedEffect?: boolean;
}

interface GameOutcomeEvent {
    type: 'positive' | 'negative' | 'neutral';
    description: string;
    profit?: number;
}


interface GameState {
    day: number;
    maxDays: number;
    balance: number;
    currentEvent: GameEvent | null;
    outcomeEvent: GameOutcomeEvent | null;
    marketSentiment: 'euphoric' | 'bullish' | 'neutral' | 'bearish' | 'panic';
    ponziScore: number;
    lastActionStatus: string | null;
    history: PortfolioHistoryPoint[];
    usedEventIds: number[]; // Track IDs of events shown in this cycle
}

// --- Initial State ---
const MAX_DAYS = 30;
const INITIAL_BALANCE = 1000;
const INITIAL_STATE: GameState = {
    day: 0,
    maxDays: MAX_DAYS,
    balance: INITIAL_BALANCE,
    currentEvent: null,
    outcomeEvent: null,
    marketSentiment: 'neutral',
    ponziScore: 0,
    lastActionStatus: null,
    history: [{ day: 0, value: INITIAL_BALANCE }],
    usedEventIds: [], // Initialize used event IDs
};

// --- Mock Data & Helpers ---
// Added unique 'id' to each event
const MOCK_EVENTS: Omit<GameEvent, 'actionOptions'>[] = [
    { id: 1, type: 'rumor', title: 'Rumor Mill: New Altcoin Gaining Traction', description: 'Whispers on CryptoX suggest a new altcoin could be the next big thing. Dev wallet holds 50% of supply.', potentialGain: '5x-10x?', isHighRisk: true, subtleClue: 'High dev wallet concentration often signals centralization risk or potential dump.' },
    { id: 2, type: 'tweet', title: 'Influencer Tweet: Promising Project Alert!', description: 'A popular crypto influencer is hyping a new project with ambitious goals. DYOR!', potentialGain: '100x (maybe)', isHighRisk: true, subtleClue: 'Influencer hype without substance often leads to pump-and-dumps. Verify the claims.' },
    { id: 3, type: 'marketShift', title: 'Market Jitters', description: 'Uncertainty looms as regulatory discussions intensify. Market sentiment showing signs of turning bearish.', sentimentEffect: 'bearish', subtleClue: 'Investing during market uncertainty or "jitters" is often risky as sentiment can sour quickly. Bear markets are born in euphoria and bull markets in depression.' },
    { id: 4, type: 'scamOpportunity', title: 'Exclusive Presale Invitation', description: 'An opportunity to invest in a promising new token before it hits the market. Limited spots available! Contract unverified.', isHighRisk: true, subtleClue: 'Unverified contracts are extremely risky and a common sign of scams.' },
    { id: 5, type: 'rumor', title: 'Tech Breakthrough Announced', description: 'Reports of a significant technological advancement in a lesser-known project emerge. Seems legit?', token: 'GARBAGE', isHighRisk: false, subtleClue: 'Genuine tech advancements can drive value, assuming the report is accurate.' },
    { id: 6, type: 'marketShift', title: 'Market Euphoria!', description: 'Green candles everywhere! A wave of optimism sweeps through the crypto space.', sentimentEffect: 'euphoric', subtleClue: 'Extreme euphoria often signals a market top. Buying during peak hype is very risky (Exit Liquidity). Bear markets are born in euphoria.' },
    { id: 7, type: 'news', title: 'Major Exchange Lists $SAFE', description: '$SAFE token has just been listed on a top-tier exchange! Price jumped 30% in the last hour.', token: 'SAFE', delayedEffect: true, isHighRisk: true, subtleClue: 'Investing *after* a major listing pump ("sell the news") can be dangerous as early investors take profits.' },
    { id: 8, type: 'tweet', title: 'Elon Mentions Altcoin Project (Yesterday!)', description: 'Elon Musk tweeted about an altcoin yesterday, causing a massive pump. Is it too late to get in?', potentialGain: '???', isHighRisk: true, delayedEffect: true, subtleClue: 'Chasing pumps based on old news (even celebrity tweets) is often a losing strategy.' },
    { id: 9, type: 'news', title: 'Project Audit Results Released', description: 'Project CLOWNCHAIN passed its security audit! Report looks clean.', token: 'CLOWN', isHighRisk: false, delayedEffect: false, subtleClue: 'A successful audit from a reputable firm reduces security risks, but doesn\'t guarantee price appreciation.' },
    { id: 10, type: 'scamOpportunity', title: 'Yield Farm Offering 1000% APY', description: 'New farm just launched offering insane returns on $XYZ staking. Deposit requires approving unlimited token spend.', potentialGain: '1000% APY!', isHighRisk: true, subtleClue: 'Unsustainably high APYs and requests for unlimited token approvals are major red flags for scams.' },
    { id: 11, type: 'marketShift', title: 'Massive Liquidation Cascade', description: 'Panic selling triggers a cascade of liquidations across major platforms. Sentiment is rock bottom.', sentimentEffect: 'panic', subtleClue: 'Panic selling can present buying opportunities ("buy the dip" or "buy when there is blood in the streets"), but timing is critical and risky. Ensure the project fundamentals remain sound. Bull markets are often born in depression like this.' },
    { id: 12, type: 'nftOpportunity', title: 'Hyped NFT Mint LIVE!', description: 'A new PFP project with huge Discord buzz is minting now! Floor could 10x, or go to zero.', potentialGain: '10x?', isHighRisk: true, delayedEffect: true, subtleClue: 'NFT mints are highly volatile. Success often depends on timing, overall market sentiment, and team execution, not just hype.' },
    { id: 13, type: 'nftOpportunity', title: 'NFT Floor Price Speculation', description: 'Talk of a major influencer sweeping the floor of the "Bored YC Kittens" collection. Maybe pump incoming?', isHighRisk: true, delayedEffect: true, subtleClue: 'Speculating on NFT floor prices based on rumors is extremely risky and akin to gambling.' },
    { id: 14, type: 'nftOpportunity', title: '"Free" NFT Claim Available', description: 'Claim your free commemorative NFT by connecting your wallet and signing the transaction. Looks legit?', isHighRisk: true, subtleClue: '"Free" mints requiring transaction signing (especially approvals) are often wallet drainer scams.' },
    { id: 15, type: 'exploit', title: 'Protocol Hack Reported', description: 'Breaking news: A popular DeFi protocol has been exploited. Token price is tanking.', token: 'SAFE', sentimentEffect: 'panic', isHighRisk: true, subtleClue: 'Investing in hacked projects, even after a price drop, is very risky until the vulnerability is fixed and funds are potentially recovered.' },
    { id: 16, type: 'rumor', title: 'Partnership Speculation', description: 'Rumors swirling about a potential partnership between Project CLOWNCHAIN and a major tech company.', token: 'CLOWN', isHighRisk: false, delayedEffect: true, subtleClue: 'Partnership rumors can pump prices, but gains often fade if the partnership isn\'t confirmed or impactful ("buy the rumor, sell the news").' },
    { id: 17, type: 'marketShift', title: 'Stablecoin Depegs Slightly', description: 'A major stablecoin briefly lost its peg, causing some market instability.', sentimentEffect: 'bearish', subtleClue: 'Stablecoin depegs can cause widespread panic and negatively impact even unrelated assets due to loss of confidence.' },
    { id: 18, type: 'daoDrama', title: 'Dev Threatens to Fork', description: 'Lead developer of GARBAGECOIN is threatening to fork the project after a community disagreement.', token: 'GARBAGE', isHighRisk: true, subtleClue: 'Internal project conflicts and fork threats often negatively impact token price due to uncertainty and division.' },
    { id: 19, type: 'scamOpportunity', title: 'Telegram "Signal Group" Tip', description: 'Got a "guaranteed 5x" signal from a private Telegram group. Requires buying a low-cap token immediately.', isHighRisk: true, subtleClue: 'Paid "signal groups" are often pump-and-dump schemes orchestrating exit liquidity for insiders.' },
    { id: 20, type: 'news', title: 'New Regulation Proposed', description: 'Governments are discussing new regulations for DeFi. Market is reacting cautiously.', sentimentEffect: 'neutral', subtleClue: 'Regulatory news can create long-term uncertainty or opportunity. The impact depends heavily on the specifics of the regulation.' },
    // --- New Events (ID 21-30) ---
    { id: 21, type: 'utilityLaunch', title: 'Project XYZ Launches Mainnet App', description: 'After months of development, Project XYZ has launched its utility application on mainnet.', token: 'XYZ', isHighRisk: false, subtleClue: 'Successful mainnet launches *can* drive price if the utility gains adoption, but often the hype is already priced in.' },
    { id: 22, type: 'microcap', title: 'New Microcap Gem? (100k Mcap)', description: 'Found a token with a tiny market cap. Devs seem active on Telegram. Could this be the next 1000x?', potentialGain: '1000x?', isHighRisk: true, subtleClue: 'Extremely low market cap tokens are highly volatile and susceptible to manipulation or abandonment ("rug pull"). Risk is immense.' },
    { id: 23, type: 'exploit', title: 'Flash Loan Exploit on DEX', description: 'A DEX pool involving $SAFE was just exploited using a flash loan, manipulating the price temporarily.', token: 'SAFE', sentimentEffect: 'panic', isHighRisk: true, subtleClue: 'Flash loan exploits can cause extreme, temporary price volatility. Trading during such events is dangerous.' },
    { id: 24, type: 'daoDrama', title: 'DAO Treasury Debate Heated', description: 'Major disagreement in the GARBAGECOIN DAO over how to spend treasury funds. Contentious vote upcoming.', token: 'GARBAGE', isHighRisk: true, subtleClue: 'Contentious DAO governance can signal instability and potentially lead to negative price action or forks.' },
    { id: 25, type: 'rumor', title: 'Token Unlock Approaching', description: 'Large token unlock schedule for early investors of $CLOWN is coming next week.', token: 'CLOWN', isHighRisk: true, delayedEffect: true, subtleClue: 'Large token unlocks often lead to selling pressure as early investors cash out, potentially decreasing the price.' },
    { id: 26, type: 'tweet', title: 'Mysterious Dev Tweet', description: 'Lead dev of $XYZ tweeted a cryptic message: "Big things coming. Phase 2 imminent." Vague!', token: 'XYZ', isHighRisk: true, subtleClue: 'Vague, hype-driven tweets without concrete details are often used to pump prices short-term. Be wary of "announcements of announcements".' },
    { id: 27, type: 'nftOpportunity', title: 'NFT Project "Migrates" to V2', description: 'The "Sad Shibas" NFT project announced a V2 migration. Holders need to burn V1 and mint V2. Some fees apply.', isHighRisk: true, subtleClue: 'V2 migrations can sometimes be legitimate upgrades, but are also used as tactics in slow rug pulls or cash grabs. Investigate the reasons and fees.' },
    { id: 28, type: 'scamOpportunity', title: 'Airdrop Claim Requires Seed Phrase', description: 'A website claims you\'re eligible for a huge $SAFE airdrop, but requires entering your seed phrase to verify.', isHighRisk: true, potentialGain: 'Free Tokens!', subtleClue: 'NEVER enter your seed phrase on any website. This is ALWAYS a scam to steal your funds.' },
    { id: 29, type: 'news', title: 'Competitor Project Gains Traction', description: 'A major competitor to Project CLOWNCHAIN seems to be gaining significant user adoption.', token: 'CLOWN', isHighRisk: true, subtleClue: 'Strong competition can negatively impact a project\'s market share and token price if they fail to innovate or retain users.' },
    { id: 30, type: 'marketShift', title: 'Fear & Greed Index at "Extreme Fear"', description: 'The Crypto Fear & Greed Index has dropped to "Extreme Fear" levels amidst market declines.', sentimentEffect: 'panic', isHighRisk: true, subtleClue: '"Extreme Fear" can indicate maximum pessimism, potentially signaling a market bottom (Contrarian Indicator). Buying here is risky but can be rewarding.' },
];


// More realistic price simulation considering sentiment and token specifics
const getMockTokenPrice = (token: TokenSymbol, sentiment: GameState['marketSentiment'], day: number): number => {
    let basePrice = 1;
    let volatility = 0.1; // Base daily volatility

    switch (token) {
        case 'GARBAGE': basePrice = 0.05; volatility = 0.3; break;
        case 'CLOWN': basePrice = 0.2; volatility = 0.2; break;
        case 'SAFE': basePrice = 1.2; volatility = 0.15; break; // Starts seemingly stable
        case 'XYZ': basePrice = 1; volatility = 0.05; break; // Base token is less volatile
    }

    let sentimentMultiplier = 1;
    switch (sentiment) {
        case 'euphoric': sentimentMultiplier = 1.1; volatility *= 1.5; break;
        case 'bullish': sentimentMultiplier = 1.05; volatility *= 1.2; break;
        case 'bearish': sentimentMultiplier = 0.95; volatility *= 1.2; break;
        case 'panic': sentimentMultiplier = 0.8; volatility *= 2.0; break;
        case 'neutral':
        default: break;
    }

    // Simulate price drift over days with randomness and volatility
    // Using Math.sin for some cyclical nature, plus random noise
    const timeFactor = Math.sin(day / 5) * 0.1 + 1; // Slow cycle effect
    const randomNoise = (Math.random() - 0.5) * 2 * volatility; // Random daily fluctuation based on volatility

    // Ensure price doesn't go below a very small floor (e.g., 0.0001)
    return Math.max(0.0001, basePrice * sentimentMultiplier * timeFactor * (1 + randomNoise));
};

interface PortfolioHistoryPoint {
    day: number;
    value: number; // Total portfolio value
}

// Chart Configuration
const chartConfig = {
    value: {
        label: "Portfolio Value (DAI)",
        color: "hsl(var(--primary-foreground))",
    },
} satisfies ChartConfig;


export function DeFiDegenGame({ className, questId, xpReward }: DeFiDegenGameProps) {
    const { toast } = useToast();
    const { addXp, username } = useUser();
    const [gameState, setGameState] = React.useState<GameState>(INITIAL_STATE);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isFinished, setIsFinished] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);
    const [investmentPercentage, setInvestmentPercentage] = React.useState<number>(25); // Default 25%
    const [earnedXp, setEarnedXp] = React.useState(0); // Track earned XP for final display

    const handleStartGame = () => {
        setIsPlaying(true);
        setIsFinished(false);
        setIsCompleted(false);
        setEarnedXp(0); // Reset earned XP display
        setGameState(INITIAL_STATE); // Reset to initial state, including usedEventIds
        setInvestmentPercentage(25); // Reset slider
        // Trigger the first day/event immediately after starting
        handleNextDay(INITIAL_STATE);
    };

     const handleNextDay = (currentState: GameState = gameState) => {
         if (currentState.day >= currentState.maxDays) {
             handleEndGame(currentState);
             return;
         }

         // --- Game Logic for advancing a day ---
         const nextDay = currentState.day + 1;

         // 1. Clear the outcome from the previous turn (Handled by setting outcomeEvent to null below)

         // 2. Update Market Sentiment (can be influenced by events or drift)
         let newSentiment = currentState.marketSentiment;
         const sentimentRoll = Math.random();
         if (sentimentRoll < 0.05 && newSentiment !== 'panic') newSentiment = 'panic';
         else if (sentimentRoll < 0.2 && newSentiment !== 'bearish') newSentiment = 'bearish';
         else if (sentimentRoll < 0.7) newSentiment = 'neutral';
         else if (sentimentRoll < 0.9 && newSentiment !== 'bullish') newSentiment = 'bullish';
         else if (newSentiment !== 'euphoric') newSentiment = 'euphoric';


         // 3. Generate a new, unique event
         let newEvent: GameEvent | null = null;
         let nextUsedEventIds = [...currentState.usedEventIds];

         // Filter out events already used in this cycle
         let availableEvents = MOCK_EVENTS.filter(event => !currentState.usedEventIds.includes(event.id));

         // If all unique events have been shown, reset the used list and allow repeats
         if (availableEvents.length === 0) {
             console.warn("All unique events shown in this cycle. Resetting and allowing repeats.");
             nextUsedEventIds = []; // Reset used IDs
             availableEvents = MOCK_EVENTS; // Use all events again
         }

         // Select a random event from the available ones
         const eventToShow = availableEvents[Math.floor(Math.random() * availableEvents.length)];
         newEvent = { ...eventToShow };
         nextUsedEventIds.push(newEvent.id); // Add the new event's ID to the used list for the *next* state update


         // Override sentiment if event specifies it
         if (newEvent.sentimentEffect) {
             newSentiment = newEvent.sentimentEffect;
         }

         // Determine Action Options based on the Event Type
         let actionOptions = ['Ignore']; // Default action
         // All events are now investable or ignorable
         actionOptions = ['Invest', 'Ignore'];
         newEvent.actionOptions = actionOptions;

         // 4. Calculate current portfolio value and update history
         const currentTotalValue = currentState.balance; // Value is just the balance now
         const newHistory = [...currentState.history, { day: nextDay, value: currentTotalValue }];


         setGameState(prev => ({
             ...prev,
             day: nextDay,
             currentEvent: newEvent,
             outcomeEvent: null, // Clear previous outcome
             marketSentiment: newSentiment,
             lastActionStatus: null, // Clear previous action status
             balance: currentTotalValue,
             history: newHistory, // Update history
             usedEventIds: nextUsedEventIds, // Update used event IDs
         }));
     };

     const handlePlayerAction = (action: string) => {
         const event = gameState.currentEvent;
         if (!event || !event.actionOptions?.includes(action)) return;

         let statusUpdate: string | null = `Day ${gameState.day}: You chose to ${action}.`;
         let newBalance = gameState.balance;
         let newPonziScore = gameState.ponziScore;
         let outcome: GameOutcomeEvent | null = null;

         // Amount to invest based on slider and balance
         const investmentAmount = gameState.balance * (investmentPercentage / 100);

         // --- Shared Logic for Determining Outcome ---
         let profitMultiplier = 0;
         let lossFactor = 0;
         let potentialOutcomeType: GameOutcomeEvent['type'] = 'negative'; // Default to negative

         // Base chance of failure, higher for risky events
         const baseFailureChance = event.isHighRisk ? 0.40 : 0.15;
         let failureChance = baseFailureChance;
         if (event.delayedEffect) failureChance += 0.20;

         // Adjust failure chance based on market sentiment (opposite of original request for realism)
         if (gameState.marketSentiment === 'panic') failureChance += 0.25; // Higher risk in panic
         if (gameState.marketSentiment === 'bearish') failureChance += 0.10;
         if (gameState.marketSentiment === 'euphoric') failureChance += 0.30; // Higher risk in euphoria (buying tops)
         if (gameState.marketSentiment === 'bullish') failureChance -= 0.05; // Lower risk in bullish market
         failureChance = Math.max(0.05, Math.min(0.95, failureChance)); // Clamp chance between 5% and 95%

         // --- Specific logic for NFT Opportunities ---
          if (event.type === 'nftOpportunity') {
             // NFT success highly dependent on bullish/euphoric sentiment
             if (gameState.marketSentiment === 'neutral' || gameState.marketSentiment === 'bearish' || gameState.marketSentiment === 'panic') {
                 failureChance = 0.85; // High chance of failure in neutral/bear markets
             } else { // Bullish or Euphoric
                 failureChance = 0.30; // Lower chance, but still risky
             }
         }

        // Specific logic for Market Jitters
        let marketJittersFailureOverride = false;
        if (event.title === 'Market Jitters' && action === 'Invest') {
             failureChance = 1.0; // Force failure
             marketJittersFailureOverride = true; // Flag for specific message
         }

         const randomNumber = Math.random();
         const eventFailed = randomNumber < failureChance;
         const feedbackClue = event.subtleClue ? ` Hint: ${event.subtleClue}` : "";
         // Use investmentAmount directly for loss calculation
         const calculatedLossAmount = investmentAmount * ( (event.isHighRisk || event.type === 'scamOpportunity' || event.type === 'microcap') ? 1.0 : (0.3 + Math.random() * 0.4) );

         // --- Logic for 'Invest' Action ---
         if (action === 'Invest') {
             if (investmentAmount <= 0) {
                 statusUpdate += ' Selected 0% to invest.';
                 outcome = { type: 'neutral', description: `You observed the event but chose not to invest any DAI.` };
             } else if (newBalance < investmentAmount) {
                 statusUpdate += ' Not enough balance!';
                 outcome = { type: 'neutral', description: `Insufficient funds to invest $${investmentAmount.toFixed(2)} DAI.` };
             } else {
                 // Check for Failure First
                 if (eventFailed) {
                     potentialOutcomeType = 'negative';
                     // Increased loss factor for high risk / scams / microcaps
                     lossFactor = (event.isHighRisk || event.type === 'scamOpportunity' || event.type === 'microcap') ? 1.0 : (0.3 + Math.random() * 0.4);
                     const lossAmount = investmentAmount * lossFactor; // Loss based on investment amount
                     newBalance -= lossAmount;
                     newPonziScore += event.isHighRisk ? 15 : 5;

                     // Construct failure feedback
                     if (marketJittersFailureOverride) {
                         outcome = { type: 'negative', description: `Investing during 'Market Jitters' backfired due to uncertainty! Lost $${lossAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount };
                     } else if (event.type === 'scamOpportunity') {
                         outcome = { type: 'negative', description: `It was a trap! The '${event.title}' rugged. Lost your full investment of $${investmentAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount }; // Loss is investmentAmount
                     } else if (event.type === 'nftOpportunity') {
                         outcome = { type: 'negative', description: `The NFT hype died! Investment in '${event.title}' rugged or went to zero. Lost $${lossAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount };
                     } else if (event.delayedEffect && event.title.includes('Elon')) { // Specific case for Elon tweet
                         outcome = { type: 'negative', description: `Chased the pump too late! Elon's tweet was yesterday. Lost $${lossAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount };
                     } else if (gameState.marketSentiment === 'euphoric' && event.type !== 'marketShift') {
                         outcome = { type: 'negative', description: `Bought the top! Investment based on '${event.title}' failed during market euphoria. Lost $${lossAmount.toFixed(2)} DAI. Remember: Bear markets are born in Euphoria.${feedbackClue}`, profit: -lossAmount };
                     } else if (event.type === 'microcap') {
                        outcome = { type: 'negative', description: `The microcap '${event.title}' turned out to be worthless! Lost your full investment of $${investmentAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount };
                     } else {
                         outcome = { type: 'negative', description: `Investment based on '${event.title}' failed. Lost $${lossAmount.toFixed(2)} DAI.${feedbackClue}`, profit: -lossAmount };
                     }
                     statusUpdate += ` Investment failed. Lost $${lossAmount.toFixed(2)} DAI.`;
                 } else {
                     // --- Success Case ---
                     potentialOutcomeType = 'positive';
                     let baseProfitMultiplier = (event.isHighRisk || event.type === 'nftOpportunity' || event.type === 'microcap') ? (0.5 + Math.random() * 1.5) : (0.1 + Math.random() * 0.4);
                     if (event.type === 'nftOpportunity') baseProfitMultiplier *= 1.2; // NFTs can have higher upside
                     if (event.type === 'microcap') baseProfitMultiplier *= 2.0; // Microcaps can have massive upside if they hit

                     // Adjust profit based on sentiment (synergy with success)
                     if (gameState.marketSentiment === 'euphoric') baseProfitMultiplier *= 1.5;
                     if (gameState.marketSentiment === 'bullish') baseProfitMultiplier *= 1.2;
                     if (gameState.marketSentiment === 'bearish') baseProfitMultiplier *= 0.8; // Reduced gains in bear
                     if (gameState.marketSentiment === 'panic') baseProfitMultiplier *= 0.5; // Even lower gains in panic
                     profitMultiplier = Math.max(0, baseProfitMultiplier);

                     const profit = investmentAmount * profitMultiplier; // Profit based on investment amount
                     newBalance += profit;
                     const panicSellMessage = (event.title === 'Massive Liquidation Cascade' && gameState.marketSentiment === 'panic') ? " Buying during extreme fear paid off!" : "";
                     const extremeFearMessage = (event.title.includes('Extreme Fear') && gameState.marketSentiment === 'panic') ? " Contrarian investing during extreme fear worked this time!" : "";

                      if (event.type === 'nftOpportunity') {
                         outcome = { type: 'positive', description: `Mint successful / Floor pumped on '${event.title}'! Your investment of $${investmentAmount.toFixed(2)} DAI yielded a profit of $${profit.toFixed(2)} DAI!`, profit: profit };
                      } else if (event.type === 'microcap') {
                        outcome = { type: 'positive', description: `Moonshot! The microcap '${event.title}' exploded! Your investment of $${investmentAmount.toFixed(2)} DAI yielded a profit of $${profit.toFixed(2)} DAI!`, profit: profit };
                      } else {
                         outcome = { type: 'positive', description: `Good call on '${event.title}'! Your investment of $${investmentAmount.toFixed(2)} DAI yielded a profit of $${profit.toFixed(2)} DAI!${panicSellMessage}${extremeFearMessage}`, profit: profit };
                      }
                     statusUpdate += ` Gained $${profit.toFixed(2)} DAI!`;
                 }
             }
         }
         // --- Logic for 'Ignore' Action ---
         else if (action === 'Ignore') {
             statusUpdate += ` Market sentiment: ${gameState.marketSentiment}.`;

             // --- Simulate and Show Potential Outcome When Ignoring ---
             // Reuse the same failure chance calculation as 'Invest'
             let ignoreFailureChance = baseFailureChance;
             if (event.delayedEffect) ignoreFailureChance += 0.20;
             if (gameState.marketSentiment === 'panic') ignoreFailureChance += 0.25;
             if (gameState.marketSentiment === 'bearish') ignoreFailureChance += 0.10;
             if (gameState.marketSentiment === 'euphoric') ignoreFailureChance += 0.30;
             if (gameState.marketSentiment === 'bullish') ignoreFailureChance -= 0.05;
             ignoreFailureChance = Math.max(0.05, Math.min(0.95, ignoreFailureChance));
             if (event.title === 'Market Jitters') ignoreFailureChance = 1.0; // Jitters always fails if invested

             const ignoredEventFailed = randomNumber < ignoreFailureChance; // Use the same random number

             if (ignoredEventFailed) {
                 // Ignored a failing event (dodged a bullet)
                 outcome = {
                    type: 'neutral',
                    description: `You ignored '${event.title}'. Good call! It turned out to be ${event.isHighRisk ? 'a rug/scam' : 'a losing trade'}.${feedbackClue}`
                 };
             } else {
                 // Ignored a successful event (missed opportunity)
                 let baseProfitMultiplier = (event.isHighRisk || event.type === 'nftOpportunity' || event.type === 'microcap') ? (0.5 + Math.random() * 1.5) : (0.1 + Math.random() * 0.4);
                 if (event.type === 'nftOpportunity') baseProfitMultiplier *= 1.2;
                 if (event.type === 'microcap') baseProfitMultiplier *= 2.0;

                 if (gameState.marketSentiment === 'euphoric') baseProfitMultiplier *= 1.5;
                 if (gameState.marketSentiment === 'bullish') baseProfitMultiplier *= 1.2;
                 if (gameState.marketSentiment === 'bearish') baseProfitMultiplier *= 0.8;
                 if (gameState.marketSentiment === 'panic') baseProfitMultiplier *= 0.5;
                 profitMultiplier = Math.max(0, baseProfitMultiplier);
                 // Simulate profit based on a default 25% investment when ignoring
                 const potentialProfit = (gameState.balance * 0.25 * profitMultiplier);

                 outcome = {
                     type: 'neutral',
                     description: `You ignored '${event.title}'. Turns out it pumped! You missed out on a potential profit of ~$${potentialProfit.toFixed(2)} DAI.`
                 };
             }

         }

         // Calculate portfolio value AFTER action and update history for the current day again
         const valueAfterAction = Math.max(0, newBalance); // Ensure balance doesn't go negative
         // Update the history point for the *current* day with the value *after* the action
         const updatedHistory = gameState.history.map(h =>
             h.day === gameState.day ? { ...h, value: valueAfterAction } : h
         );
         // If the action was taken on day N, the history array should reflect the balance *at the end* of day N.
         // handleNextDay then adds day N+1 with this balance.


         setGameState(prev => ({
             ...prev,
             balance: valueAfterAction,
             ponziScore: newPonziScore,
             lastActionStatus: statusUpdate,
             currentEvent: null, // Clear event after action
             outcomeEvent: outcome, // Show the outcome
             history: updatedHistory, // Update history with value after action for the current day
         }));
     };


    const handleEndGame = (finalState: GameState) => {
        setIsPlaying(false);
        setIsFinished(true);
        // Final value is already tracked in the last history point or current balance
        const finalTotalValue = finalState.history[finalState.history.length - 1]?.value ?? finalState.balance;

        const resultMessage = `Survived ${finalState.day} days! Final Value: $${finalTotalValue.toFixed(2)} DAI. Ponzi Score: ${finalState.ponziScore}.`;
        setGameState(prev => ({ ...prev, lastActionStatus: resultMessage }));

        const performanceFactor = finalTotalValue / INITIAL_BALANCE;
         let finalEarnedXp = 0; // Use a separate variable for the final XP calculation
         // More nuanced XP based on performance and Ponzi score
         if (performanceFactor > 1) { // Profitable
            // Base XP for profit, reduced by high Ponzi score
             finalEarnedXp = Math.floor(xpReward * Math.min(1, (performanceFactor - 1)) * Math.max(0.1, (1 - finalState.ponziScore / 100)));
         } else if (finalTotalValue <= 0.1 * INITIAL_BALANCE) { // Rekt (less than 10% initial balance)
             finalEarnedXp = 5; // Small XP for getting totally rekt (learning the hard way)
         } else { // Loss, but not rekt
             finalEarnedXp = 10; // Base XP for surviving but losing
         }
         finalEarnedXp = Math.max(0, Math.min(xpReward, finalEarnedXp)); // Ensure XP is within bounds
         setEarnedXp(finalEarnedXp); // Set state for display

        if (!isCompleted && finalEarnedXp > 0) {
             addXp(finalEarnedXp);
             setIsCompleted(true);
             setTimeout(() => {
                 toast({
                     title: "Cycle Complete!",
                     description: `${resultMessage} You earned ${finalEarnedXp} XP!`,
                     variant: finalEarnedXp > 10 ? "success" : "default",
                     duration: 7000,
                 });
             }, 0);
         } else if (!isCompleted) { // Added condition to prevent duplicate toast if already completed (e.g., score 0)
             setTimeout(() => {
                 toast({
                     title: "Cycle Complete!",
                     description: `${resultMessage} No XP earned.`,
                     duration: 7000,
                 });
             }, 0);
         }
    };

    const handleContinueNextDay = () => {
        // Simply advance the day, clearing the outcome
        handleNextDay(gameState);
    };

    const handleRestartGame = () => {
         // Reset all state related to the game instance
         setIsPlaying(false);
         setIsFinished(false);
         setIsCompleted(false);
         setEarnedXp(0);
         setGameState(INITIAL_STATE); // Reset to initial state
         setInvestmentPercentage(25); // Reset slider

         // Immediately start the game again
         setIsPlaying(true); // Set playing to true before calling handleNextDay
         handleNextDay(INITIAL_STATE); // Start day 1

         setTimeout(() => {
             toast({
                 title: "Restarting Cycle!",
                 description: "Fresh start, fresh pain. Good luck!",
                 icon: <RefreshCw size={16} />
             });
         }, 0);
     };

    return (
         <Card className={cn(
            "flex flex-col min-h-[600px] relative overflow-hidden",
            "bg-gradient-to-br from-primary/[.40] to-accent/[.40]", // Gradient background with opacity
            "text-primary-foreground",
             className
         )}>
            <div className="relative z-10 flex flex-col flex-1">
                <CardHeader> {/* Removed bg-primary to inherit gradient */}
                    <div className="flex justify-between items-start">
                        <div className="flex-1 text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-xl text-primary-foreground">
                                <TrendingUp className="text-accent" /> DeFi Degen: Survive the Cycle
                            </CardTitle>
                            <CardDescription className="text-sm md:text-base text-primary-foreground/80">
                                🧠💸 &quot;Think you&apos;re built different? Prove it.&quot; | Quest ID: {questId}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleRestartGame} className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                                <RefreshCw size={16} />
                                <span className="sr-only">Restart Game</span>
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                                        <HelpCircle size={16} />
                                        <span className="sr-only">Game Info</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent side="top" align="end" className="w-80 text-base bg-popover text-popover-foreground">
                                    <p>Start with ${INITIAL_BALANCE} DAI and survive {MAX_DAYS} days. React to market events, invest in projects, and avoid scams. Your balance changes daily. Use the slider to decide how much % of your balance to risk on 'Invest' actions. Reach the end without getting rekt!</p>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     {isFinished && (
                         <Badge variant={isCompleted && earnedXp > 0 ? "success" : "default"} className="w-fit mt-1 text-sm px-2 py-1 bg-background/20 text-primary-foreground mx-auto">
                             {isCompleted && earnedXp > 0 ? `Completed (+${earnedXp} XP)` : "Finished"}
                         </Badge>
                     )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">

                    {!isPlaying && !isFinished && (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                            <LineChartIcon size={48} className="text-primary-foreground/80"/>
                            <p className="text-base text-primary-foreground/80 text-center">
                                Start with ${INITIAL_BALANCE} DAI and survive {MAX_DAYS} days of market madness. Use the chart to track your performance. Can you make it?
                            </p>
                            <Button onClick={handleStartGame} size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Play size={18}/> Start the Cycle
                            </Button>
                        </div>
                    )}

                    {isPlaying && !isFinished && (
                        <div className="flex-1 flex flex-col space-y-4">
                            <div className="h-[200px] border border-primary-foreground/20 p-2 rounded-md bg-primary/50"> {/* Changed background to primary/50 */}
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <LineChart
                                        accessibilityLayer
                                        data={gameState.history}
                                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--primary-foreground)/0.2)" />
                                        <XAxis
                                            dataKey="day"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => `${value}`}
                                            interval="preserveStartEnd"
                                            domain={[0, 'dataMax']}
                                            type="number"
                                            label={{ value: 'Day', position: 'insideBottomRight', offset: -5, fill: 'hsl(var(--primary-foreground)/0.8)' }}
                                            tick={{ fontSize: '0.8rem', fill: 'hsl(var(--primary-foreground)/0.7)' }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                            domain={['auto', 'auto']}
                                            width={80}
                                            tick={{ fontSize: '0.8rem', fill: 'hsl(var(--primary-foreground)/0.7)' }}
                                        />
                                        <RechartsTooltip
                                            cursor={false}
                                            contentStyle={{ backgroundColor: 'hsl(var(--background)/0.8)', border: '1px solid hsl(var(--border)/0.5)', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            content={<ChartTooltipContent indicator="dot" hideLabel />}
                                        />
                                        <Line
                                            dataKey="value"
                                            type="monotone"
                                            stroke="var(--color-value)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </div>

                            <div className="flex justify-between items-center text-base border border-primary-foreground/20 p-2 rounded-md text-primary-foreground/90 bg-primary/50"> {/* Changed background */}
                                <span>Day: {gameState.day} / {gameState.maxDays}</span>
                                <span>Balance: <span className={cn(
                                    "font-semibold",
                                    gameState.balance >= INITIAL_BALANCE ? "text-green-400" : "text-red-400"
                                )}>${gameState.balance.toFixed(2)} DAI</span></span>
                                <span className="capitalize">Market Sentiment: <span className={cn(
                                    gameState.marketSentiment === 'euphoric' && 'text-green-400',
                                    gameState.marketSentiment === 'bullish' && 'text-green-300',
                                    gameState.marketSentiment === 'neutral' && 'text-primary-foreground/70',
                                    gameState.marketSentiment === 'bearish' && 'text-red-300',
                                    gameState.marketSentiment === 'panic' && 'text-red-500 font-bold',
                                )}>{gameState.marketSentiment}</span></span>
                            </div>

                            {gameState.currentEvent?.actionOptions?.includes('Invest') && (
                                <div className="space-y-2 bg-primary/50 p-3 rounded-md"> {/* Changed background */}
                                    <Label htmlFor="investment-slider" className="text-base text-primary-foreground/90">Investment % (of Balance): {investmentPercentage}%</Label>
                                    <Slider
                                        id="investment-slider"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={[investmentPercentage]}
                                        onValueChange={(value) => setInvestmentPercentage(value[0])}
                                    />
                                </div>
                            )}

                            {gameState.outcomeEvent ? (
                                <Card className="bg-primary border-primary-foreground/20 text-primary-foreground"> {/* Changed background */}
                                    <CardHeader className="pb-2 pt-3 px-3">
                                        <CardTitle className="text-lg flex items-center gap-1 text-primary-foreground">
                                            {gameState.outcomeEvent.type === 'positive' && <TrendingUp size={16} className="text-green-400"/>}
                                            {gameState.outcomeEvent.type === 'negative' && <TrendingDown size={16} className="text-red-400"/>}
                                            {gameState.outcomeEvent.type === 'neutral' && <Info size={16} className="text-primary-foreground/70"/>}
                                            Result of Day {gameState.day}:
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-base pb-3 px-3 text-primary-foreground/80">
                                        <p className="mb-3">{gameState.outcomeEvent.description}</p>
                                    </CardContent>
                                    <Button onClick={handleContinueNextDay} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Continue to Day {gameState.day + 1}</Button>
                                </Card>
                            ) : gameState.currentEvent ? (
                                <Card className="bg-primary border-primary-foreground/20 text-primary-foreground"> {/* Changed background */}
                                    <CardHeader className="pb-2 pt-3 px-3">
                                        <CardTitle className="text-lg flex items-center gap-1 text-primary-foreground">
                                            {gameState.currentEvent.type === 'rumor' && <Brain size={16} className="text-purple-400"/>}
                                            {gameState.currentEvent.type === 'tweet' && <Send size={16} className="text-blue-400"/>}
                                            {gameState.currentEvent.type === 'marketShift' && (gameState.marketSentiment === 'bearish' || gameState.marketSentiment === 'panic' ? <TrendingDown size={16} className="text-red-400"/> : <TrendingUp size={16} className="text-green-400"/>)}
                                            {['scamOpportunity', 'exploit'].includes(gameState.currentEvent.type) && <TrendingDown size={16} className="text-yellow-400"/>}
                                            {['news', 'utilityLaunch'].includes(gameState.currentEvent.type) && <Info size={16} className="text-primary-foreground/70"/>}
                                            {gameState.currentEvent.type === 'nftOpportunity' && <ImageIcon size={16} className="text-indigo-400"/>}
                                            {['daoDrama', 'microcap'].includes(gameState.currentEvent.type) && <HelpCircle size={16} className="text-orange-400"/>}
                                            {gameState.currentEvent.title}
                                        </CardTitle>
                                        {gameState.currentEvent.potentialGain && <Badge variant="outline" className="w-fit text-sm mt-1 border-primary-foreground/30 text-primary-foreground/80">{gameState.currentEvent.potentialGain}</Badge>}
                                    </CardHeader>
                                    <CardContent className="text-base pb-3 px-3">
                                        <p className="text-primary-foreground/80 mb-3">{gameState.currentEvent.description}</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {gameState.currentEvent.actionOptions?.map(action => (
                                                <Button
                                                    key={action}
                                                    variant="outline"
                                                    size="default"
                                                    onClick={() => handlePlayerAction(action)}
                                                     className="text-base border-primary-foreground/30 text-primary-foreground/90 hover:bg-primary-foreground/10"
                                                >
                                                    {action}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-center text-primary-foreground/70 italic p-4 border border-primary-foreground/20 border-dashed rounded-md min-h-[100px] text-base bg-primary/50"> {/* Changed background */}
                                    {gameState.lastActionStatus || "Processing..."}
                                </div>
                            )}

                            <Progress value={(gameState.day / gameState.maxDays) * 100} className="h-2 mt-auto" />
                        </div>
                    )}

                    {isFinished && (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                            <h3 className="text-2xl font-semibold text-primary-foreground">Cycle Ended!</h3>
                            <div className="h-[150px] w-full max-w-md border border-primary-foreground/20 p-1 rounded-md bg-primary/50"> {/* Changed background */}
                                <ChartContainer config={chartConfig} className="h-full w-full">
                                    <LineChart data={gameState.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--primary-foreground)/0.2)" />
                                        <XAxis dataKey="day" hide />
                                        <YAxis hide domain={['auto', 'auto']}/>
                                         <RechartsTooltip
                                            cursor={false}
                                            contentStyle={{ backgroundColor: 'hsl(var(--background)/0.8)', border: '1px solid hsl(var(--border)/0.5)', color: 'hsl(var(--foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            content={<ChartTooltipContent indicator="dot" hideLabel />}
                                          />
                                        <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false}/>
                                    </LineChart>
                                </ChartContainer>
                            </div>
                            <p className="text-base text-primary-foreground/80 text-center">{gameState.lastActionStatus || "Game Over"}</p>
                            {earnedXp > 0 && <p className="text-primary font-medium text-lg">Earned {earnedXp} XP!</p>}
                            <div className="flex gap-4">
                                <Button variant="outline" className="gap-2 text-base border-primary-foreground/30 text-primary-foreground/90 hover:bg-primary-foreground/10" disabled>
                                <Send size={16}/> Flex Result
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
}

