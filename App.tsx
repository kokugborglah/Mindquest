import React, { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Quest, UserProfile, DailyProgress, Badge, ChatMode } from './types';
import { JEREMY_PROFILE, INITIAL_QUESTS, MOCK_PROGRESS_DATA, ALL_BADGES } from './constants';
import ProfileHeader from './components/ProfileHeader';
import QuestBoard from './components/QuestBoard';
import ParentDashboard from './components/ParentDashboard';
import Chatbot from './components/Chatbot';
import Badges from './components/Badges';
import BadgeNotification from './components/BadgeNotification';
import ChatModeSelector from './components/ChatModeSelector';
import { generateQuests, startChat, evaluateQuest } from './services/geminiService';

type View = 'jeremy' | 'parent';

// Configure the PDF.js worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';


function App() {
  const [profile, setProfile] = useState<UserProfile>(JEREMY_PROFILE);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [view, setView] = useState<View>('jeremy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressData, setProgressData] = useState<DailyProgress[]>(MOCK_PROGRESS_DATA);
  const [lastAwardedBadge, setLastAwardedBadge] = useState<Badge | null>(null);
  const [curriculumContent, setCurriculumContent] = useState<string | null>(null);
  const [curriculumFileName, setCurriculumFileName] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('general');

  useEffect(() => {
    const savedContent = localStorage.getItem('mindquest_curriculumContent');
    const savedFileName = localStorage.getItem('mindquest_curriculumFileName');
    if (savedContent && savedFileName) {
        setCurriculumContent(savedContent);
        setCurriculumFileName(savedFileName);
    }
    startChat(chatMode, savedContent);
  }, []);

  useEffect(() => {
    startChat(chatMode, curriculumContent);
  }, [chatMode, curriculumContent]);

  const checkAndAwardBadges = (updatedProfile: UserProfile, completedQuest: Quest) => {
    const newlyAwarded: Badge[] = [];

    for (const badge of ALL_BADGES) {
        if (updatedProfile.badges.includes(badge.id)) continue;

        let earned = false;
        switch (badge.id) {
            case 'first-quest':
                if (updatedProfile.completedQuests.length === 1) earned = true;
                break;
            case 'quest-novice':
                if (updatedProfile.completedQuests.length === 5) earned = true;
                break;
            case 'quest-adept':
                if (updatedProfile.completedQuests.length === 15) earned = true;
                break;
            case 'weekend-warrior':
                if (completedQuest.isWeekendQuest) earned = true;
                break;
        }

        if (earned) {
            newlyAwarded.push(badge);
        }
    }
    
    if (newlyAwarded.length > 0) {
        setProfile(p => ({ ...p, badges: [...p.badges, ...newlyAwarded.map(b => b.id)] }));
        setLastAwardedBadge(newlyAwarded[0]);
    }
  };
  
  const awardXpAndCheckBadges = (xp: number, completedQuest: Quest) => {
    setProfile(prevProfile => {
        const updatedProfile = { ...prevProfile, completedQuests: [...prevProfile.completedQuests, completedQuest.id] };

        let newXp = updatedProfile.xp + xp;
        let newLevel = updatedProfile.level;
        let newXpToNextLevel = updatedProfile.xpToNextLevel;

        if (newXp >= newXpToNextLevel) {
            newLevel += 1;
            newXp -= newXpToNextLevel;
            newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
        }

        const finalProfile = {
            ...updatedProfile,
            xp: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
        };

        checkAndAwardBadges(finalProfile, completedQuest);
        return finalProfile;
    });

    setProgressData(prevData => {
        const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const dayIndex = prevData.findIndex(d => d.date === todayKey);
        if (dayIndex === -1) return prevData;

        const newData = [...prevData];
        newData[dayIndex] = { ...newData[dayIndex], completed: newData[dayIndex].completed + 1 };
        return newData;
    });
  }

  const handleCompleteQuest = useCallback((questId: string, xp: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;
    
    setQuests(prevQuests =>
      prevQuests.map(q => (q.id === questId ? { ...q, isCompleted: true } : q))
    );

    awardXpAndCheckBadges(xp, quest);
  }, [quests]);

  const handleEvaluateQuest = async (questId: string, userInput: string) => {
      const quest = quests.find(q => q.id === questId);
      if (!quest) return;

      setQuests(prev => prev.map(q => q.id === questId ? { ...q, isEvaluating: true, userInput } : q));
      
      const result = await evaluateQuest(quest, userInput);

      setQuests(prev => prev.map(q => q.id === questId ? { ...q, isCompleted: result.completed, feedback: result.feedback, isEvaluating: false } : q));

      if (result.completed && result.xpAwarded > 0) {
          awardXpAndCheckBadges(result.xpAwarded, { ...quest, isCompleted: true });
      }
  };

  const handleGenerateQuests = useCallback(async () => {
    setIsGenerating(true);
    const existingTitles = quests.map(q => q.title);
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    
    const newQuestsData = await generateQuests(existingTitles, isWeekend);
    const newQuests: Quest[] = newQuestsData.map((q, index) => ({
      ...q,
      id: `gemini-quest-${Date.now()}-${index}`,
      isCompleted: false,
    }));

    if (newQuests.length > 0) {
      setQuests(prev => [...prev.filter(q => q.isCompleted), ...newQuests]);
    }
    setIsGenerating(false);
  }, [quests]);

  const handleCurriculumUpload = (content: string, fileName: string) => {
    localStorage.setItem('mindquest_curriculumContent', content);
    localStorage.setItem('mindquest_curriculumFileName', fileName);
    setCurriculumContent(content);
    setCurriculumFileName(fileName);
    // The useEffect hook will call startChat
  };

  const handleClearCurriculum = () => {
    localStorage.removeItem('mindquest_curriculumContent');
    localStorage.removeItem('mindquest_curriculumFileName');
    setCurriculumContent(null);
    setCurriculumFileName(null);
    // The useEffect hook will call startChat
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute top-0 left-0 h-96 w-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
             <svg className="w-10 h-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.06 13.29l-2.22-2.22a1.5 1.5 0 0 1 2.12-2.12l1.16 1.17l3.27-4.36a1.5 1.5 0 1 1 2.4 1.8l-4.25 5.67a1.5 1.5 0 0 1-1.21.57h-.02a1.5 1.5 0 0 1-1.25-.7z"></path></svg>
            <h1 className="text-3xl font-black tracking-tighter">MindQuest</h1>
          </div>
          <div className="bg-gray-800 p-1 rounded-full flex space-x-1">
            <button
              onClick={() => setView('jeremy')}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${view === 'jeremy' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Jeremy's View
            </button>
            <button
              onClick={() => setView('parent')}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${view === 'parent' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Parent View
            </button>
          </div>
        </header>

        <main>
          {view === 'jeremy' ? (
            <>
              <ProfileHeader profile={profile} />
              <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xl font-bold text-white mb-3">My Badges</h2>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 h-full">
                        <Badges earnedBadges={profile.badges} allBadges={ALL_BADGES} />
                    </div>
                </div>
                 <div>
                    <h2 className="text-xl font-bold text-white mb-3">Sparky's AI Modes</h2>
                     <ChatModeSelector 
                        currentMode={chatMode} 
                        onModeChange={setChatMode} 
                        isCurriculumLoaded={!!curriculumContent} 
                    />
                </div>
              </div>
              <QuestBoard 
                quests={quests} 
                onCompleteQuest={handleCompleteQuest} 
                onEvaluateQuest={handleEvaluateQuest}
                onGenerateQuests={handleGenerateQuests} 
                isLoading={isGenerating} 
               />
              <Chatbot isCurriculumLoaded={!!curriculumContent} />
            </>
          ) : (
            <ParentDashboard 
              profile={profile} 
              quests={quests} 
              progressData={progressData}
              curriculumFileName={curriculumFileName}
              onCurriculumUpload={handleCurriculumUpload}
              onClearCurriculum={handleClearCurriculum}
            />
          )}
        </main>
        <BadgeNotification badge={lastAwardedBadge} onDismiss={() => setLastAwardedBadge(null)} />
      </div>
    </div>
  );
}

export default App;
