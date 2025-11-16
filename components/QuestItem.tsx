import React, { useState } from 'react';
import { Quest } from '../types';
import { SparkleIcon, CalendarDaysIcon } from './icons';

interface QuestItemProps {
  quest: Quest;
  onComplete: (questId: string, xp: number) => void;
  onEvaluate: (questId: string, userInput: string) => void;
}

const QuestItem: React.FC<QuestItemProps> = ({ quest, onComplete, onEvaluate }) => {
  const [userInput, setUserInput] = useState('');

  const handleSubmitForReview = () => {
    if (userInput.trim()) {
        onEvaluate(quest.id, userInput);
    }
  };

  const isInteractive = quest.requiresInput;

  return (
    <div className={`transition-all duration-300 rounded-lg p-5 mb-3 border ${quest.isCompleted ? 'bg-green-500/10 border-green-500/30' : quest.isWeekendQuest ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-800/60 border-gray-700'} ${!isInteractive && !quest.isCompleted ? 'hover:border-cyan-400/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {quest.isWeekendQuest && !quest.isCompleted && <CalendarDaysIcon className="w-5 h-5 mr-2 text-purple-400 flex-shrink-0" />}
            <h3 className={`font-bold text-lg ${quest.isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{quest.title}</h3>
          </div>
          <p className={`text-sm mt-1 ${quest.isWeekendQuest ? 'pl-7' : ''} ${quest.isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{quest.description}</p>
        </div>
        {!isInteractive && (
            <div className="flex flex-col items-end ml-4 flex-shrink-0">
                <div className={`flex items-center font-semibold text-yellow-300 mb-2 ${quest.isCompleted ? 'opacity-50' : ''}`}>
                    <SparkleIcon className="w-4 h-4 mr-1"/>
                    <span>{quest.xp} XP</span>
                </div>
                <button
                    onClick={() => onComplete(quest.id, quest.xp)}
                    disabled={quest.isCompleted}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${quest.isCompleted ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : quest.isWeekendQuest ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                >
                    {quest.isCompleted ? 'Done!' : 'Complete'}
                </button>
            </div>
        )}
      </div>

      {isInteractive && !quest.isCompleted && (
        <div className="mt-4">
          <div className="flex items-center font-semibold text-yellow-300 mb-2">
            <SparkleIcon className="w-4 h-4 mr-1"/>
            <span>Up to {quest.xp} XP</span>
          </div>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="What did you do to complete this mission?"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            rows={2}
            disabled={quest.isEvaluating}
          ></textarea>
          <button
            onClick={handleSubmitForReview}
            disabled={!userInput.trim() || quest.isEvaluating}
            className="mt-2 w-full sm:w-auto float-right px-4 py-2 text-sm font-semibold rounded-md transition-colors bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {quest.isEvaluating ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Evaluating...</span>
                </div>
            ) : 'Submit for Review'}
          </button>
        </div>
      )}

      {quest.feedback && (
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <p className="font-bold text-cyan-300 text-sm">Sparky's Feedback:</p>
            <p className="text-white text-sm">{quest.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default QuestItem;
