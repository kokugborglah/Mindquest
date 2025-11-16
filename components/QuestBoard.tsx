import React from 'react';
import { Quest } from '../types';
import QuestItem from './QuestItem';
import { SparkleIcon, BrainIcon } from './icons';

interface QuestBoardProps {
  quests: Quest[];
  onCompleteQuest: (questId: string, xp: number) => void;
  onEvaluateQuest: (questId: string, userInput: string) => void;
  onGenerateQuests: () => void;
  isLoading: boolean;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onCompleteQuest, onEvaluateQuest, onGenerateQuests, isLoading }) => {
  const pendingQuests = quests.filter(q => !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);
  const dailyFocusQuests = pendingQuests.slice(0, 3);
  const bonusQuests = pendingQuests.slice(3);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <BrainIcon className="w-8 h-8 mr-3 text-cyan-300"/>
            <h2 className="text-2xl font-bold text-cyan-300">Agent Missions</h2>
        </div>
        <button
          onClick={onGenerateQuests}
          disabled={isLoading}
          className="flex items-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-wait text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <SparkleIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generating...' : 'New Missions'}
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Daily Focus</h3>
        {dailyFocusQuests.length > 0 ? dailyFocusQuests.map(quest => (
          <QuestItem key={quest.id} quest={quest} onComplete={onCompleteQuest} onEvaluate={onEvaluateQuest} />
        )) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
              <p className="text-green-400 font-semibold">All quests completed for today! Great job!</p>
              <p className="text-gray-400 mt-2">Click "New Missions" to get a fresh challenge from Gemini.</p>
          </div>
        )}
      </div>

      {bonusQuests.length > 0 && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-3">Bonus Quests</h3>
            {bonusQuests.map(quest => (
                <QuestItem key={quest.id} quest={quest} onComplete={onCompleteQuest} onEvaluate={onEvaluateQuest} />
            ))}
        </div>
      )}

      {completedQuests.length > 0 && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-3">Completed Today</h3>
            {completedQuests.map(quest => (
                <QuestItem key={quest.id} quest={quest} onComplete={onCompleteQuest} onEvaluate={onEvaluateQuest}/>
            ))}
        </div>
      )}
    </div>
  );
};

export default QuestBoard;
