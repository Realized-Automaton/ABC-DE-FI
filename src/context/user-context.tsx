
'use client';

import type { ReactNode } from 'react';
import * as React from 'react';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
  xp: number;
  level: number;
  nextLevelXp: number;
  addXp: (amount: number) => void;
  profilePicture: string | null; // Add profile picture state (data URI or URL)
  setProfilePicture: (picture: string | null) => void; // Add setter
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

// Function to calculate XP needed for the next level (example formula)
const calculateNextLevelXp = (level: number): number => {
  // Ensure level is at least 1 for calculation
  const effectiveLevel = Math.max(1, level);
  return 150 * Math.pow(effectiveLevel, 1.5); // Exponential growth
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = React.useState<string>("CryptoLearn"); // Default username updated
  const [level, setLevel] = React.useState<number>(1); // Start at level 1
  const [xp, setXp] = React.useState<number>(0); // Start with 0 XP
   // Calculate initial nextLevelXp based on starting level
  const [nextLevelXp, setNextLevelXp] = React.useState<number>(calculateNextLevelXp(1));
  const [profilePicture, setProfilePicture] = React.useState<string | null>(null); // Initialize profile picture state
  const { toast } = useToast(); // Get toast function

   const addXp = React.useCallback((amount: number) => {
    setXp((currentXp) => {
      let newXp = currentXp + amount;
      let currentLevel = level; // Use state level
      let currentNextLevelXp = nextLevelXp; // Use state nextLevelXp

      // Store level ups to toast after state updates
      const levelUps: number[] = [];

      // Check for level up(s)
      while (newXp >= currentNextLevelXp) {
        currentLevel++;
        newXp -= currentNextLevelXp; // Subtract XP needed for the level up
        currentNextLevelXp = calculateNextLevelXp(currentLevel); // Calculate XP for the *new* next level
        levelUps.push(currentLevel); // Record the new level achieved
      }

      // Update state if level changed
      if (levelUps.length > 0) {
        // Use functional updates for setLevel and setNextLevelXp
        // to ensure they are based on the latest state if called rapidly
        setLevel(prevLevel => prevLevel + levelUps.length);
        setNextLevelXp(currentNextLevelXp); // The final calculated next level XP

         // Defer toast notifications using setTimeout to avoid state update during render
         setTimeout(() => {
           levelUps.forEach(lvl => {
             toast({
               title: "Level Up!",
               description: `Congratulations! You reached Level ${lvl}!`,
               duration: 3000, // Added duration
             });
           });
         }, 0);
      }


      return newXp; // Return the final XP value (potentially after deducting for level ups)
    });
  }, [level, nextLevelXp, toast]); // Ensure all dependencies used in the callback are listed

  // Effect to update nextLevelXp whenever the level changes
  React.useEffect(() => {
      setNextLevelXp(calculateNextLevelXp(level));
  }, [level]);


  return (
    <UserContext.Provider value={{ username, setUsername, xp, level, nextLevelXp, addXp, profilePicture, setProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

