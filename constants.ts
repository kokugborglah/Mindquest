import { Quest, UserProfile, DailyProgress, Badge } from './types';
import { BadgeIcon, SunriseIcon, ZapIcon, CalendarDaysIcon } from './components/icons';

export const JEREMY_PROFILE: UserProfile = {
  name: 'Jeremy',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  completedQuests: [],
  badges: [],
};

export const ALL_BADGES: Badge[] = [
    { id: 'first-quest', name: 'First Quest!', description: 'You completed your very first quest. The journey begins!', icon: SunriseIcon },
    { id: 'quest-novice', name: 'Quest Novice', description: 'Completed 5 quests. You\'re getting the hang of this!', icon: BadgeIcon },
    { id: 'quest-adept', name: 'Quest Adept', description: 'Completed 15 quests. A true adventurer!', icon: BadgeIcon },
    { id: 'perfect-day', name: 'Perfect Day', description: 'Completed all 3 daily focus quests. Amazing focus!', icon: ZapIcon },
    { id: 'weekend-warrior', name: 'Weekend Warrior', description: 'Completed a special weekend quest.', icon: CalendarDaysIcon },
];


export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Morning Gear Check',
    description: 'Before leaving for school, check your bag for all your books, your lunch, and your water bottle.',
    xp: 25,
    isCompleted: false,
    requiresInput: false,
  },
  {
    id: 'quest-2',
    'title': 'The Unforgettable Belt',
    'description': 'After physical activities, make sure you put your belt back on before leaving the changing room.',
    'xp': 30,
    'isCompleted': false,
    requiresInput: false,
  },
  {
    id: 'quest-3',
    'title': 'End-of-Day Sweep',
    'description': 'At the end of the school day, do a quick scan of your desk and chair to make sure you haven\'t left anything behind.',
    'xp': 25,
    'isCompleted': false,
    requiresInput: false,
  },
];

export const MOCK_PROGRESS_DATA: DailyProgress[] = [
    { date: 'Mon', completed: 1 },
    { date: 'Tue', completed: 2 },
    { date: 'Wed', completed: 1 },
    { date: 'Thu', completed: 3 },
    { date: 'Fri', completed: 2 },
    { date: 'Sat', completed: 4 },
    { date: 'Sun', completed: 3 },
];
