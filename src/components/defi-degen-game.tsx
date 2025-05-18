
'use client';

import * as React from 'react';
import Image from 'next/image'; // Import next/image
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, DollarSign, TrendingUp, TrendingDown, Play, RefreshCw, Send, LineChart as LineChartIcon, Info, HelpCircle, Image as ImageIconLucide } from 'lucide-react'; // Renamed Image to ImageIconLucide
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

// Add flags for deterministic outcomes
interface GameEvent {
    id: number; // Unique identifier for the event
    type: 'rumor' | 'tweet' | 'marketShift' | 'scamOpportunity' | 'news' | 'nftOpportunity' | 'daoDrama' | 'exploit' | 'utilityLaunch' | 'microcap' | 'positiveDevelopment';
    title: string;
    description: string;
    token?: TokenSymbol;
    potentialGain?: string;
    actionOptions?: string[];
    sentimentEffect?: GameState['marketSentiment'];
    isHighRisk?: boolean;
    isGuaranteedLoss?: boolean;
    isGuaranteedProfit?: boolean;
    profitMultiplier?: number;
    subtleClue?: string;
    delayedEffect?: boolean;
}

interface GameOutcomeEvent {
    type: 'positive' | 'negative' | 'neutral';
    description: string;
    profit?: number; // Profit is positive, loss is negative
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
    usedEventIds: number[];
    consecutiveNegativeEvents: number; // Added to track streaks of highly negative events
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
    usedEventIds: [],
    consecutiveNegativeEvents: 0, // Initialize counter
};

// --- Mock Data & Helpers ---
const MOCK_EVENTS: Omit<GameEvent, 'actionOptions'>[] = [
    // Negative / Loss Events
    { id: 2, type: 'tweet', title: 'Influencer Tweet: Promising Project Alert!', description: 'A popular crypto influencer is hyping a new project with ambitious goals. DYOR!', potentialGain: '100x (maybe)', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Influencer hype without substance often leads to pump-and-dumps. Verify the claims.' },
    { id: 4, type: 'scamOpportunity', title: 'Exclusive Presale Invitation', description: 'An opportunity to invest in a promising new token before it hits the market. Limited spots available! Contract unverified.', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Unverified contracts are extremely risky and a common sign of scams.' },
    { id: 7, type: 'news', title: 'Major Exchange Lists $SAFE', description: '$SAFE token has just been listed on a top-tier exchange! Price jumped 30% in the last hour.', token: 'SAFE', delayedEffect: true, isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Investing *after* a major listing pump ("sell the news") can be dangerous as early investors take profits.' },
    { id: 8, type: 'tweet', title: 'Elon Mentions Altcoin Project (Yesterday!)', description: 'Elon Musk tweeted about an altcoin yesterday, causing a massive pump. Is it too late to get in?', potentialGain: '???', isHighRisk: true, delayedEffect: true, isGuaranteedLoss: true, subtleClue: 'Chasing pumps based on old news (even celebrity tweets) is often a losing strategy.' },
    { id: 10, type: 'scamOpportunity', title: 'Yield Farm Offering 1000% APY', description: 'New farm just launched offering insane returns on $XYZ staking. Deposit requires approving unlimited token spend.', potentialGain: '1000% APY!', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Unsustainably high APYs and requests for unlimited token approvals are major red flags for scams.' },
    { id: 13, type: 'nftOpportunity', title: 'NFT Floor Price Speculation', description: 'Talk of a major influencer sweeping the floor of the "Bored YC Kittens" collection. Maybe pump incoming?', isHighRisk: true, delayedEffect: true, isGuaranteedLoss: true, subtleClue: 'Speculating on NFT floor prices based on rumors is extremely risky and akin to gambling.' },
    { id: 14, type: 'nftOpportunity', title: '"Free" NFT Claim Available', description: 'Claim your free commemorative NFT by connecting your wallet and signing the transaction. Looks legit?', isHighRisk: true, isGuaranteedLoss: true, subtleClue: '"Free" mints requiring transaction signing (especially approvals) are often wallet drainer scams.' },
    { id: 15, type: 'exploit', title: 'Protocol Hack Reported', description: 'Breaking news: A popular DeFi protocol has been exploited. Token price is tanking.', token: 'SAFE', sentimentEffect: 'panic', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Investing in hacked projects, even after a price drop, is very risky until the vulnerability is fixed and funds are potentially recovered.' },
    { id: 18, type: 'daoDrama', title: 'Dev Threatens to Fork', description: 'Lead developer of GARBAGECOIN is threatening to fork the project after a community disagreement.', token: 'GARBAGE', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Internal project conflicts and fork threats often negatively impact token price due to uncertainty and division.' },
    { id: 19, type: 'scamOpportunity', title: 'Telegram "Signal Group" Tip', description: 'Got a "guaranteed 5x" signal from a private Telegram group. Requires buying a low-cap token immediately.', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Paid "signal groups" are often pump-and-dump schemes orchestrating exit liquidity for insiders.' },
    { id: 22, type: 'microcap', title: 'New Microcap Gem? (100k Mcap)', description: 'Found a token with a tiny market cap. Devs seem active on Telegram. Could this be the next 1000x?', potentialGain: '1000x?', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Extremely low market cap tokens are highly volatile and susceptible to manipulation or abandonment ("rug pull"). Risk is immense.' },
    { id: 23, type: 'exploit', title: 'Flash Loan Exploit on DEX', description: 'A DEX pool involving $SAFE was just exploited using a flash loan, manipulating the price temporarily.', token: 'SAFE', sentimentEffect: 'panic', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Flash loan exploits can cause extreme, temporary price volatility. Trading during such events is dangerous.' },
    { id: 24, type: 'daoDrama', title: 'DAO Treasury Debate Heated', description: 'Major disagreement in the GARBAGECOIN DAO over how to spend treasury funds. Contentious vote upcoming.', token: 'GARBAGE', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Contentious DAO governance can signal instability and potentially lead to negative price action or forks.' },
    { id: 25, type: 'rumor', title: 'Token Unlock Approaching', description: 'Large token unlock schedule for early investors of $CLOWN is coming next week.', token: 'CLOWN', isHighRisk: true, delayedEffect: true, isGuaranteedLoss: true, subtleClue: 'Large token unlocks often lead to selling pressure as early investors cash out, potentially decreasing the price.' },
    { id: 27, type: 'nftOpportunity', title: 'NFT Project "Migrates" to V2', description: 'The "Sad Shibas" NFT project announced a V2 migration. Holders need to burn V1 and mint V2. Some fees apply.', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'V2 migrations can sometimes be legitimate upgrades, but are also used as tactics in slow rug pulls or cash grabs. Investigate the reasons and fees.' },
    { id: 28, type: 'scamOpportunity', title: 'Airdrop Claim Requires Seed Phrase', description: 'A website claims you\'re eligible for a huge $SAFE airdrop, but requires entering your seed phrase to verify.', isHighRisk: true, potentialGain: 'Free Tokens!', isGuaranteedLoss: true, subtleClue: 'NEVER enter your seed phrase on any website. This is ALWAYS a scam to steal your funds.' },
    { id: 29, type: 'news', title: 'Competitor Project Gains Traction', description: 'A major competitor to Project CLOWNCHAIN seems to be gaining significant user adoption.', token: 'CLOWN', isHighRisk: true, isGuaranteedLoss: true, subtleClue: 'Strong competition can negatively impact a project\'s market share and token price if they fail to innovate or retain users.' },
    { id: 6, type: 'marketShift', title: 'Market Euphoria!', description: 'Green candles everywhere! A wave of optimism sweeps through the crypto space.', sentimentEffect: 'euphoric', subtleClue: 'Extreme euphoria often signals a market top. Buying during peak hype is very risky (Exit Liquidity). Bear markets are born in euphoria.' },

    // Positive / Potential Profit Events
    { id: 1, type: 'rumor', title: 'Rumor Mill: New Altcoin Gaining Traction', description: 'Whispers on CryptoX suggest a new altcoin could be the next big thing. Dev wallet holds 50% of supply.', potentialGain: '5x-10x?', isHighRisk: true, profitMultiplier: 3.0, subtleClue: 'High dev wallet concentration often signals centralization risk or potential dump.' },
    { id: 5, type: 'rumor', title: 'Tech Breakthrough Announced', description: 'Reports of a significant technological advancement in a lesser-known project emerge. Seems legit?', token: 'GARBAGE', isHighRisk: false, profitMultiplier: 2.5, subtleClue: 'Genuine tech advancements can drive value, assuming the report is accurate.' },
    { id: 9, type: 'news', title: 'Project Audit Results Released', description: 'Project CLOWNCHAIN passed its security audit! Report looks clean.', token: 'CLOWN', isHighRisk: false, delayedEffect: false, isGuaranteedProfit: true, profitMultiplier: 1.3, subtleClue: 'A successful audit from a reputable firm reduces security risks, but doesn\'t guarantee price appreciation. Small profit potential.' },
    { id: 11, type: 'marketShift', title: 'Massive Liquidation Cascade', description: 'Panic selling triggers a cascade of liquidations across major platforms. Sentiment is rock bottom.', sentimentEffect: 'panic', subtleClue: 'Panic selling can present buying opportunities ("buy the dip" or "buy when there is blood in the streets"), but timing is critical and risky. Ensure the project fundamentals remain sound. Bull markets are often born in depression like this.' , profitMultiplier: 3.5 },
    { id: 12, type: 'nftOpportunity', title: 'Hyped NFT Mint LIVE!', description: 'A new PFP project with huge Discord buzz is minting now! Floor could 10x, or go to zero.', potentialGain: '10x?', isHighRisk: true, delayedEffect: true, profitMultiplier: 4.5, subtleClue: 'NFT mints are highly volatile. Success often depends on timing, overall market sentiment, and team execution, not just hype.' },
    { id: 16, type: 'rumor', title: 'Partnership Speculation', description: 'Rumors swirling about a potential partnership between Project CLOWNCHAIN and a major tech company.', token: 'CLOWN', isHighRisk: false, delayedEffect: true, profitMultiplier: 2.2, subtleClue: 'Partnership rumors can pump prices, but gains often fade if the partnership isn\'t confirmed or impactful ("buy the rumor, sell the news").' },
    { id: 21, type: 'utilityLaunch', title: 'Project XYZ Launches Mainnet App', description: 'After months of development, Project XYZ has launched its utility application on mainnet.', token: 'XYZ', isHighRisk: false, isGuaranteedProfit: true, profitMultiplier: 1.8, subtleClue: 'Successful mainnet launches *can* drive price if the utility gains adoption, but often the hype is already priced in.' },
    { id: 26, type: 'tweet', title: 'Mysterious Dev Tweet', description: 'Lead dev of $XYZ tweeted a cryptic message: "Big things coming. Phase 2 imminent." Vague!', token: 'XYZ', isHighRisk: true, profitMultiplier: 2.0, subtleClue: 'Vague, hype-driven tweets without concrete details are often used to pump prices short-term. Be wary of "announcements of announcements".' },
    { id: 30, type: 'marketShift', title: 'Fear & Greed Index at "Extreme Fear"', description: 'The Crypto Fear & Greed Index has dropped to "Extreme Fear" levels amidst market declines.', sentimentEffect: 'panic', isHighRisk: true, profitMultiplier: 3.2, subtleClue: '"Extreme Fear" can indicate maximum pessimism, potentially signaling a market bottom (Contrarian Indicator). Buying here is risky but can be rewarding.' },
    { id: 31, type: 'positiveDevelopment', title: 'Community Grant Approved for Project XYZ!', description: 'Project XYZ has successfully secured a significant development grant from a well-known foundation. Funds will be used for scaling and new features.', token: 'XYZ', isGuaranteedProfit: true, profitMultiplier: 2.0, subtleClue: 'Grants provide resources and signal external validation for a project, often leading to positive sentiment and development progress.' },
    { id: 32, type: 'positiveDevelopment', title: 'Successful Protocol Upgrade Deployed', description: 'Project CLOWNCHAIN just deployed a major protocol upgrade, improving efficiency and adding new functionality. No issues reported.', token: 'CLOWN', isGuaranteedProfit: true, profitMultiplier: 1.6, subtleClue: 'Smooth protocol upgrades can boost investor confidence and attract new users by demonstrating technical competence and progress.' },
    { id: 33, type: 'news', title: 'Positive Regulatory Clarity Emerges', description: 'A government agency released a statement clarifying some regulations around DeFi, which is being interpreted positively by the market.', isHighRisk: false, isGuaranteedProfit: true, profitMultiplier: 1.5, subtleClue: 'Positive regulatory news can reduce uncertainty and attract institutional interest, often leading to market upticks.' },
    { id: 34, type: 'rumor', title: 'Whale Accumulation Detected for GARBAGECOIN', description: 'On-chain data suggests a few large wallets (whales) have been steadily accumulating GARBAGECOIN over the past week.', token: 'GARBAGE', isHighRisk: false, profitMultiplier: 2.8, subtleClue: 'Whale accumulation can sometimes precede price pumps as large holders anticipate positive news or try to drive up the price. However, it can also be market manipulation.' },
    { id: 35, type: 'nftOpportunity', title: 'Blue-Chip NFT Project Announces Airdrop for Holders', description: 'Holders of the "CryptoPunks V3" NFT collection will receive an airdrop of new "PunkDoge" tokens. Speculation is driving up Punk V3 prices.', isHighRisk: false, profitMultiplier: 1.9, subtleClue: 'Airdrops from established projects can generate significant value for holders, often causing the price of the parent NFT or token to increase in anticipation.' },

    // Neutral / Context Events
    { id: 3, type: 'marketShift', title: 'Market Jitters', description: 'Uncertainty looms as regulatory discussions intensify. Market sentiment showing signs of turning bearish.', sentimentEffect: 'bearish', subtleClue: 'Investing during market uncertainty or "jitters" is often risky as sentiment can sour quickly. Bear markets are born in euphoria and bull markets are born in depression.' },
    { id: 17, type: 'marketShift', title: 'Stablecoin Depegs Slightly', description: 'A major stablecoin briefly lost its peg, causing some market instability.', sentimentEffect: 'bearish', subtleClue: 'Stablecoin depegs can cause widespread panic and negatively impact even unrelated assets due to loss of confidence.' },
    { id: 20, type: 'news', title: 'New Regulation Proposed', description: 'Governments are discussing new regulations for DeFi. Market is reacting cautiously.', sentimentEffect: 'neutral', subtleClue: 'Regulatory news can create long-term uncertainty or opportunity. The impact depends heavily on the specifics of the regulation.' },
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

    const timeFactor = Math.sin(day / 5) * 0.1 + 1;
    const randomNoise = (Math.random() - 0.5) * 2 * volatility;

    return Math.max(0.0001, basePrice * sentimentMultiplier * timeFactor * (1 + randomNoise));
};

interface PortfolioHistoryPoint {
    day: number;
    value: number;
}

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
    const [investmentPercentage, setInvestmentPercentage] = React.useState<number>(25);
    const [earnedXp, setEarnedXp] = React.useState(0);

    const handleStartGame = () => {
        setIsPlaying(true);
        setIsFinished(false);
        setIsCompleted(false);
        setEarnedXp(0);
        setGameState({...INITIAL_STATE, history: [{ day: 0, value: INITIAL_BALANCE }], consecutiveNegativeEvents: 0});
        setInvestmentPercentage(25);
        handleNextDay({...INITIAL_STATE, history: [{ day: 0, value: INITIAL_BALANCE }], consecutiveNegativeEvents: 0});
    };

     const handleNextDay = (currentState: GameState = gameState) => {
         if (currentState.day >= currentState.maxDays) {
             handleEndGame(currentState);
             return;
         }

         const nextDay = currentState.day + 1;
         let newSentiment = currentState.marketSentiment;
         const sentimentRoll = Math.random();
         if (sentimentRoll < 0.05 && newSentiment !== 'panic') newSentiment = 'panic';
         else if (sentimentRoll < 0.2 && newSentiment !== 'bearish') newSentiment = 'bearish';
         else if (sentimentRoll < 0.7) newSentiment = 'neutral';
         else if (sentimentRoll < 0.9 && newSentiment !== 'bullish') newSentiment = 'bullish';
         else if (newSentiment !== 'euphoric') newSentiment = 'euphoric';

        let newEventFull: GameEvent;
        let currentNextUsedEventIds = [...currentState.usedEventIds]; // Renamed to avoid conflict in handlePlayerAction
        let currentConsecutiveNegativeEvents = currentState.consecutiveNegativeEvents || 0;

        const isEventHighlyNegative = (event: Omit<GameEvent, 'actionOptions'>): boolean => {
            return !!event.isGuaranteedLoss &&
                   (event.type === 'scamOpportunity' ||
                    event.type === 'exploit' ||
                    (event.title && event.title.toLowerCase().includes('rug pull')) ||
                    (event.title && event.title.toLowerCase().includes('honeypot')));
        };

        let eventPoolSource = MOCK_EVENTS.filter(event => !currentState.usedEventIds.includes(event.id));
        if (eventPoolSource.length === 0) {
            console.warn("All unique events shown. Resetting and allowing repeats.");
            currentNextUsedEventIds = [];
            eventPoolSource = MOCK_EVENTS;
        }

        let candidateEvent: Omit<GameEvent, 'actionOptions'>;

        if (currentConsecutiveNegativeEvents >= 2) { // Threshold to intervene
            const nonHighlyNegativePool = eventPoolSource.filter(e => !isEventHighlyNegative(e));
            if (nonHighlyNegativePool.length > 0) {
                candidateEvent = nonHighlyNegativePool[Math.floor(Math.random() * nonHighlyNegativePool.length)];
            } else {
                candidateEvent = eventPoolSource[Math.floor(Math.random() * eventPoolSource.length)];
            }
        } else {
            candidateEvent = eventPoolSource[Math.floor(Math.random() * eventPoolSource.length)];
        }

        if (isEventHighlyNegative(candidateEvent)) {
            currentConsecutiveNegativeEvents++;
        } else {
            currentConsecutiveNegativeEvents = 0;
        }

        newEventFull = { ...candidateEvent, actionOptions: ['Invest', 'Ignore'] };
        if (!currentNextUsedEventIds.includes(newEventFull.id)) { // Ensure ID is added only if not from a reset pool
            currentNextUsedEventIds.push(newEventFull.id);
        }


         if (newEventFull.sentimentEffect) {
             newSentiment = newEventFull.sentimentEffect;
         }

         const currentTotalValue = currentState.balance;
         const historyBase = currentState.history.length > 1 && currentState.history[currentState.history.length-1].day === currentState.day
                             ? currentState.history.slice(0, -1)
                             : currentState.history;
         const newHistory = [...historyBase, { day: nextDay, value: currentTotalValue }];

         setGameState(prev => ({
             ...prev,
             day: nextDay,
             currentEvent: newEventFull,
             outcomeEvent: null,
             marketSentiment: newSentiment,
             lastActionStatus: null,
             balance: currentTotalValue,
             history: newHistory,
             usedEventIds: currentNextUsedEventIds,
             consecutiveNegativeEvents: currentConsecutiveNegativeEvents,
         }));
     };

    const handlePlayerAction = (action: string) => {
        const event = gameState.currentEvent;
        if (!event || !event.actionOptions?.includes(action)) return;

        let statusUpdate: string | null = `Day ${gameState.day}: You chose to ${action}.`;
        let newBalance = gameState.balance;
        let newPonziScore = gameState.ponziScore;
        let outcome: GameOutcomeEvent | null = null;
        // Initialize nextUsedEventIds from the current state
        let nextUsedEventIds = [...gameState.usedEventIds];
        let currentConsecutiveNegativeEvents = gameState.consecutiveNegativeEvents;


        const investmentAmount = gameState.balance * (investmentPercentage / 100);
        const feedbackClue = event.subtleClue ? ` Hint: ${event.subtleClue}` : "";

        let profit = 0;

        if (action === 'Invest') {
            if (investmentAmount <= 0) {
                statusUpdate += ' Selected 0% to invest.';
                outcome = { type: 'neutral', description: `You observed the event but chose not to invest any DAI.` };
            } else if (newBalance < investmentAmount) {
                statusUpdate += ' Not enough balance!';
                outcome = { type: 'neutral', description: `Insufficient funds to invest $${investmentAmount.toFixed(2)} DAI.` };
            } else {
                let outcomeType: GameOutcomeEvent['type'] = 'negative';

                if (event.isGuaranteedLoss) {
                    profit = -investmentAmount;
                    newPonziScore += 15;
                }
                else if (event.title === 'Market Euphoria!') { profit = -investmentAmount * 0.6; newPonziScore += 5; }
                else if (event.title === 'Market Jitters') { profit = -investmentAmount * 0.2; }
                else if (event.type === 'nftOpportunity' && (gameState.marketSentiment === 'neutral' || gameState.marketSentiment === 'bearish' || gameState.marketSentiment === 'panic') && event.profitMultiplier === 4.5 ) { profit = -investmentAmount * 0.8; newPonziScore += 10;}
                else if (event.title === 'Stablecoin Depegs Slightly') { profit = -investmentAmount * 0.1; }
                else if (event.title === 'New Regulation Proposed') { profit = -investmentAmount * 0.05;}
                else if (event.isGuaranteedProfit) {
                    profit = investmentAmount * ((event.profitMultiplier || 1.2) - 1);
                    outcomeType = 'positive';
                }
                else {
                     let baseMultiplier = event.profitMultiplier || 2.0;
                     if (gameState.marketSentiment === 'euphoric') baseMultiplier *= 1.1;
                     if (gameState.marketSentiment === 'bullish') baseMultiplier *= 1.2;
                     if (gameState.marketSentiment === 'bearish') baseMultiplier *= 0.8;
                     if (gameState.marketSentiment === 'panic') baseMultiplier *= 0.7;
                     if (event.title === 'Massive Liquidation Cascade' || (event.title && event.title.includes('Extreme Fear'))) { baseMultiplier = Math.max(baseMultiplier, event.profitMultiplier || 3.5); }
                     baseMultiplier = Math.max(1.0, baseMultiplier);
                     profit = investmentAmount * (baseMultiplier - 1);
                     outcomeType = 'positive';
                }
                newBalance += profit;
                if (outcomeType === 'negative') {
                     let reason = "Investment failed.";
                     if (event.isGuaranteedLoss && event.type === 'scamOpportunity') reason = `It was a trap! The '${event.title}' rugged.`;
                     else if (event.isGuaranteedLoss && event.type === 'nftOpportunity') reason = `The NFT hype died or it rugged ('${event.title}').`;
                     else if (event.isGuaranteedLoss && event.delayedEffect) reason = `Chasing the pump ('${event.title}') too late backfired.`;
                     else if (event.isGuaranteedLoss) reason = `The setup for '${event.title}' was unfavorable.`;
                     else if (event.title === 'Market Euphoria!') reason = `Bought the top during Market Euphoria! Remember: Bear markets are born in euphoria.`;
                     else if (event.title === 'Market Jitters') reason = `Investing during Market Jitters proved too risky.`;
                     else if (event.title === 'Stablecoin Depegs Slightly') reason = `Investing during the stablecoin depeg was risky.`;
                     else if (event.title === 'New Regulation Proposed') reason = `The market reacted poorly to the proposed regulation.`;
                     else if (event.type === 'nftOpportunity'  && event.profitMultiplier === 4.5) reason = `The NFT market was too cold for '${event.title}' to succeed.`;
                     outcome = { type: 'negative', description: `${reason} Lost ${Math.abs(profit).toFixed(2)} DAI.${feedbackClue}`, profit: profit };
                     statusUpdate += ` Investment failed. Lost ${Math.abs(profit).toFixed(2)} DAI.`;
                 } else {
                     const panicBuyMessage = (event.title === 'Massive Liquidation Cascade' || (event.title && event.title.includes('Extreme Fear'))) ? " Buying during extreme fear paid off! Remember: Bull markets are often born in depression." : "";
                     const profitPercentage = profit > 0 && investmentAmount > 0 ? (profit / investmentAmount) * 100 : 0;
                     outcome = { type: 'positive', description: `Good call on '${event.title}'! Your investment of $${investmentAmount.toFixed(2)} DAI yielded a profit of $${profit.toFixed(2)} DAI (+${profitPercentage.toFixed(1)}%)!${panicBuyMessage}${feedbackClue}`, profit: profit };
                     statusUpdate += ` Gained $${profit.toFixed(2)} DAI!`;
                 }
            }
        } else if (action === 'Ignore') {
            statusUpdate += ` Market sentiment: ${gameState.marketSentiment}.`;
            let ignoreDescription = `You ignored '${event.title}'.`;
            let potentialProfitIfInvested = 0;
            const simulatedInvestment = gameState.balance * 0.25; // Use 25% as a consistent base for missed opportunity calculation

             if (event.isGuaranteedLoss || event.title === 'Market Euphoria!' || event.title === 'Market Jitters' || event.title === 'Stablecoin Depegs Slightly' || event.title === 'New Regulation Proposed' || (event.type === 'nftOpportunity' && ['neutral', 'bearish', 'panic'].includes(gameState.marketSentiment) && event.profitMultiplier === 4.5)) {
                 if (event.title === 'Market Euphoria!') potentialProfitIfInvested = -(simulatedInvestment * 0.6);
                 else if (event.title === 'Market Jitters') potentialProfitIfInvested = -(simulatedInvestment * 0.2);
                 else if (event.title === 'Stablecoin Depegs Slightly') potentialProfitIfInvested = -(simulatedInvestment * 0.1);
                 else if (event.title === 'New Regulation Proposed') potentialProfitIfInvested = -(simulatedInvestment * 0.05);
                 else if (event.type === 'nftOpportunity' && event.profitMultiplier === 4.5) potentialProfitIfInvested = -(simulatedInvestment * 0.8);
                 else potentialProfitIfInvested = -simulatedInvestment;
                 ignoreDescription += ` Good call! It turned out to be ${event.type === 'scamOpportunity' || event.isGuaranteedLoss ? 'a rug/scam or bad setup' : 'a losing trade'}. You avoided a potential loss of ~$${Math.abs(potentialProfitIfInvested).toFixed(2)} DAI.${feedbackClue}`;
             } else {
                 let baseMultiplier = event.profitMultiplier || 2.0;
                 if (gameState.marketSentiment === 'euphoric') baseMultiplier *= 1.1;
                 if (gameState.marketSentiment === 'bullish') baseMultiplier *= 1.2;
                 if (gameState.marketSentiment === 'bearish') baseMultiplier *= 0.8;
                 if (gameState.marketSentiment === 'panic') baseMultiplier *= 0.7;
                  if (event.title === 'Massive Liquidation Cascade' || (event.title && event.title.includes('Extreme Fear'))) { baseMultiplier = Math.max(baseMultiplier, event.profitMultiplier || 3.5); }
                  baseMultiplier = Math.max(1.0, baseMultiplier);
                 potentialProfitIfInvested = simulatedInvestment * (baseMultiplier - 1);
                 ignoreDescription += ` Turns out it pumped! You missed out on a potential profit of ~$${potentialProfitIfInvested.toFixed(2)} DAI.`;
             }
            outcome = { type: 'neutral', description: ignoreDescription };
        }

         const valueAfterAction = Math.max(0, newBalance);
         const updatedHistory = gameState.history.map(h =>
             h.day === gameState.day ? { ...h, value: valueAfterAction } : h
         );

         setGameState(prev => ({
             ...prev,
             balance: valueAfterAction,
             ponziScore: newPonziScore,
             lastActionStatus: statusUpdate,
             currentEvent: null,
             outcomeEvent: outcome,
             history: updatedHistory,
             usedEventIds: nextUsedEventIds, // Ensure this is correctly passed
             consecutiveNegativeEvents: currentConsecutiveNegativeEvents, // Ensure this is correctly passed
         }));
    };


    const handleEndGame = (finalState: GameState) => {
        setIsPlaying(false);
        setIsFinished(true);
        const finalTotalValue = finalState.history[finalState.history.length - 1]?.value ?? finalState.balance;
        const resultMessage = `Survived ${finalState.day} days! Final Value: $${finalTotalValue.toFixed(2)} DAI. Ponzi Score: ${finalState.ponziScore}.`;
        setGameState(prev => ({ ...prev, lastActionStatus: resultMessage }));

        const performanceFactor = finalTotalValue / INITIAL_BALANCE;
         let finalEarnedXp = 0;
         if (performanceFactor > 1) {
             finalEarnedXp = Math.floor(xpReward * Math.min(1, (performanceFactor - 1)) * Math.max(0.1, (1 - finalState.ponziScore / 100)));
         } else if (finalTotalValue <= 0.1 * INITIAL_BALANCE) {
             finalEarnedXp = 5;
         } else {
             finalEarnedXp = 10;
         }
         finalEarnedXp = Math.max(0, Math.min(xpReward, finalEarnedXp));
         setEarnedXp(finalEarnedXp);

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
         } else if (!isCompleted) {
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
        handleNextDay(gameState);
    };

    const handleRestartGame = () => {
         setIsPlaying(false); // Set isPlaying to false to show the initial start screen
         setIsFinished(false);
         setIsCompleted(false);
         setEarnedXp(0);
         setGameState({...INITIAL_STATE, history: [{ day: 0, value: INITIAL_BALANCE }], consecutiveNegativeEvents: 0});
         setInvestmentPercentage(25);
         // Do not call handleNextDay here, let the user click "Start the Cycle"
         setTimeout(() => {
             toast({
                 title: "Game Reset!",
                 description: "Ready for another cycle? Good luck!",
                 icon: <RefreshCw size={16} />
             });
         }, 0);
     };

    const handleFlexResult = () => {
        const appUrl = "https://abc-de-fi.vercel.app/";
        const flexMessage = `${username} survived ${gameState.day} days in the DeFi Degen Cycle! Final Score: $${gameState.balance.toFixed(2)} DAI. Ponzi Score: ${gameState.ponziScore}. Can you beat me? #DeFiDegenGame #ABCDeFi Try it: ${appUrl}`;
        navigator.clipboard.writeText(flexMessage)
            .then(() => {
                toast({
                    title: "Result Copied! 🚀",
                    description: `Share your degen story: ${flexMessage.substring(0,100)}...`,
                    variant: "success",
                    duration: 7000,
                });
            })
            .catch(err => {
                console.error("Failed to copy text:", err);
                toast({
                    title: "Copy Failed",
                    description: "Could not copy result to clipboard.",
                    variant: "destructive",
                });
            });
    };


    return (
         <Card className={cn(
            "flex flex-col min-h-[600px] relative overflow-hidden",
            "bg-gradient-to-br from-primary/[.40] to-accent/[.40]",
            "text-primary-foreground",
             className
         )}>
            <div className="relative z-10 flex flex-col flex-1">
                 <CardHeader className="bg-transparent">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 text-center">
                            <CardTitle className="flex items-center justify-center gap-2 text-lg md:text-xl text-primary-foreground">
                                <TrendingUp className="text-accent" /> DeFi Degen: Survive the Cycle
                            </CardTitle>
                            <CardDescription className="text-sm md:text-base text-primary-foreground/80">
                                🧠💸 &quot;Think you&apos;re built for a 10x? Prove it.&quot; | Quest ID: {questId}
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
                            <div className="h-[200px] border border-primary-foreground/20 p-2 rounded-md bg-primary/50">
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

                            <div className="flex justify-between items-center text-base border border-primary-foreground/20 p-2 rounded-md text-primary-foreground/90 bg-primary/50">
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

                            {gameState.currentEvent?.actionOptions?.includes('Invest') && !gameState.outcomeEvent && (
                                <div className="space-y-2 bg-primary/50 p-3 rounded-md">
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
                                <Card className="bg-primary border-primary-foreground/20 text-primary-foreground">
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
                                <Card className="bg-primary border-primary-foreground/20 text-primary-foreground">
                                    <CardHeader className="pb-2 pt-3 px-3">
                                        <CardTitle className="text-lg flex items-center gap-1 text-primary-foreground">
                                            {gameState.currentEvent.type === 'rumor' && <Brain size={16} className="text-purple-400"/>}
                                            {gameState.currentEvent.type === 'tweet' && <Send size={16} className="text-blue-400"/>}
                                            {gameState.currentEvent.type === 'marketShift' && (gameState.marketSentiment === 'bearish' || gameState.marketSentiment === 'panic' ? <TrendingDown size={16} className="text-red-400"/> : <TrendingUp size={16} className="text-green-400"/>)}
                                            {['scamOpportunity', 'exploit'].includes(gameState.currentEvent.type) && <TrendingDown size={16} className="text-yellow-400"/>}
                                            {['news', 'utilityLaunch', 'positiveDevelopment'].includes(gameState.currentEvent.type) && <Info size={16} className="text-primary-foreground/70"/>}
                                            {gameState.currentEvent.type === 'nftOpportunity' && <ImageIconLucide size={16} className="text-indigo-400"/>}
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
                                <div className="flex-1 flex items-center justify-center text-center text-primary-foreground/70 italic p-4 border border-primary-foreground/20 border-dashed rounded-md min-h-[100px] text-base bg-primary/50">
                                    {gameState.lastActionStatus || "Processing..."}
                                </div>
                            )}

                            <Progress value={(gameState.day / gameState.maxDays) * 100} className="h-2 mt-auto" />
                        </div>
                    )}

                    {isFinished && (
                         <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
                            {isCompleted && earnedXp > 0 && (
                                <Badge variant="success" className="w-fit text-sm px-2 py-1 bg-background/20 text-primary-foreground mx-auto">
                                     Completed
                                 </Badge>
                             )}
                             {!isCompleted && earnedXp === 0 && (
                                <Badge variant="default" className="w-fit text-sm px-2 py-1 bg-background/20 text-primary-foreground mx-auto">
                                     Finished
                                 </Badge>
                             )}
                             <h3 className="text-3xl font-semibold text-primary-foreground mt-2">Cycle Ended!</h3>
                             <p className="text-lg text-primary-foreground/80 text-center mb-2">
                                {gameState.lastActionStatus || "Game Over"}
                             </p>

                            <Button
                                variant="default"
                                size="lg"
                                className={cn(
                                    "p-0 rounded-lg shadow-lg",
                                    "bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "h-auto w-auto"
                                )}
                                onClick={handleFlexResult}
                                aria-label="Copy game result to share"
                            >
                                <div className="flex flex-col items-center p-6 rounded-lg bg-primary/80 hover:bg-primary/90 border border-primary-foreground/30 text-primary-foreground w-full text-center transition-colors">
                                    <Image
                                        src="https://i.ibb.co/bMgZz4h4/a-logo-for-a-crypto-learning-and-gaming-applicatio.png"
                                        alt="ABC DeFi Logo"
                                        width={Math.round(78 * 1.2 * 1.2)}
                                        height={Math.round(19.5 * 1.2 * 1.2)}
                                        className="h-auto mb-3"
                                        unoptimized
                                    />
                                    <span className="text-lg font-semibold" style={{ fontSize: '1.2rem' }}>DeFi Degen: Survive the Cycle</span>
                                    <span className={cn(
                                        "text-5xl font-bold my-2",
                                        gameState.balance >= INITIAL_BALANCE ? "text-green-400" : "text-red-400"
                                    )} style={{ fontSize: '3.6rem' }}>
                                        ${gameState.balance.toFixed(2)} <span className="text-2xl text-primary-foreground/80" style={{ fontSize: '1.8rem' }}>DAI</span>
                                    </span>
                                    <div className="flex items-center gap-2 text-lg text-primary-foreground/70" style={{ fontSize: '1.2rem' }}>
                                      <Send size={Math.round(22 * 1.2)}/>
                                      <span>Flex!</span>
                                    </div>
                                </div>
                            </Button>
                            {/* Conditional message for high score */}
                            {gameState.balance > 10000 && (
                                <p className="mt-4 text-center font-serif italic text-base text-primary-foreground">
                                    &quot;When Richard arrives and exposes the moles...privacy appears&quot;
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
}

