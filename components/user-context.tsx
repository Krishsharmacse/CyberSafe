'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRank = 'Vulnerable' | 'Novice' | 'Aware' | 'Guardian';

interface UserContextType {
  points: number;
  completedLessons: string[];
  userRank: UserRank;
  avatarColor: string;
  addPoints: (amount: number) => void;
  markLessonComplete: (lessonId: string, lessonPoints: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  // Example of using local storage - simplified for hackathon
  useEffect(() => {
    const savedPoints = localStorage.getItem('cyberSafePoints');
    const savedLessons = localStorage.getItem('cyberSafeLessons');
    if (savedPoints) setPoints(parseInt(savedPoints, 10));
    if (savedLessons) setCompletedLessons(JSON.parse(savedLessons));
  }, []);

  const persistState = (newPoints: number, newLessons: string[]) => {
    localStorage.setItem('cyberSafePoints', newPoints.toString());
    localStorage.setItem('cyberSafeLessons', JSON.stringify(newLessons));
  };

  const addPoints = (amount: number) => {
    const newPoints = points + amount;
    setPoints(newPoints);
    persistState(newPoints, completedLessons);
  };

  const markLessonComplete = (lessonId: string, lessonPoints: number) => {
    if (!completedLessons.includes(lessonId)) {
      const newLessons = [...completedLessons, lessonId];
      const newPoints = points + lessonPoints;
      setCompletedLessons(newLessons);
      setPoints(newPoints);
      persistState(newPoints, newLessons);
    }
  };

  let userRank: UserRank = 'Vulnerable';
  let avatarColor = 'bg-red-500 text-white';

  if (points >= 600) {
    userRank = 'Guardian';
    avatarColor = 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-2 border-blue-400';
  } else if (points >= 300) {
    userRank = 'Aware';
    avatarColor = 'bg-green-500 text-white';
  } else if (points >= 100) {
    userRank = 'Novice';
    avatarColor = 'bg-orange-500 text-white';
  }

  return (
    <UserContext.Provider value={{ points, completedLessons, userRank, avatarColor, addPoints, markLessonComplete }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
