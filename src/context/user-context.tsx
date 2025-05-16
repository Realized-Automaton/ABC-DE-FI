
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
  profilePicture: string | null;
  setProfilePicture: (picture: string | null) => void;
  easterEggActivated: boolean; // New state for easter egg
  activateEasterEgg: () => void; // New function to activate easter egg
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

const calculateNextLevelXp = (level: number): number => {
  const effectiveLevel = Math.max(1, level);
  return 150 * Math.pow(effectiveLevel, 1.5);
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = React.useState<string>("CryptoLearn");
  const [level, setLevel] = React.useState<number>(1);
  const [xp, setXp] = React.useState<number>(0);
  const [nextLevelXp, setNextLevelXp] = React.useState<number>(calculateNextLevelXp(1));
  const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
  const [easterEggActivated, setEasterEggActivated] = React.useState<boolean>(false); // Initialize easter egg state
  const { toast } = useToast();

   const addXp = React.useCallback((amount: number) => {
    setXp((currentXp) => {
      let newXp = currentXp + amount;
      let currentLevel = level;
      let currentNextLevelXp = nextLevelXp;

      const levelUps: number[] = [];

      while (newXp >= currentNextLevelXp) {
        currentLevel++;
        newXp -= currentNextLevelXp;
        currentNextLevelXp = calculateNextLevelXp(currentLevel);
        levelUps.push(currentLevel);
      }

      if (levelUps.length > 0) {
        setLevel(prevLevel => prevLevel + levelUps.length);
        setNextLevelXp(currentNextLevelXp);

         setTimeout(() => {
           levelUps.forEach(lvl => {
             toast({
               title: "Level Up!",
               description: `Congratulations! You reached Level ${lvl}!`,
               duration: 3000,
             });
           });
         }, 0);
      }
      return newXp;
    });
  }, [level, nextLevelXp, toast]);

  React.useEffect(() => {
      setNextLevelXp(calculateNextLevelXp(level));
  }, [level]);

  const activateEasterEgg = React.useCallback(() => {
    setEasterEggActivated(true);
  }, []);


  return (
    <UserContext.Provider value={{ username, setUsername, xp, level, nextLevelXp, addXp, profilePicture, setProfilePicture, easterEggActivated, activateEasterEgg }}>
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
