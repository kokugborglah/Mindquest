import React from 'react';

export interface Badge {
  id: string;
  name:string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
  isWeekendQuest?: boolean;
  requiresInput?: boolean;
  userInput?: string;
  feedback?: string;
  isEvaluating?: boolean;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedQuests: string[];
  badges: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface DailyProgress {
    date: string;
    completed: number;
}

export type ChatMode = 'general' | 'tutor' | 'exam';
