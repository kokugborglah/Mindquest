import React from 'react';
import { ChatMode } from '../types';
import { BrainIcon, BookOpenIcon, StarIcon } from './icons';

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  isCurriculumLoaded: boolean;
}

const modes: { id: ChatMode; name: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'general', name: 'General Guide', icon: BrainIcon, description: "Sparky's default friendly and encouraging personality." },
    { id: 'tutor', name: 'Homework Tutor', icon: BookOpenIcon, description: "Helps with school subjects without giving direct answers." },
    { id: 'exam', name: 'Exam Prep', icon: StarIcon, description: "Creates quizzes and offers study tips to get ready for tests." },
];

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({ currentMode, onModeChange, isCurriculumLoaded }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700 h-full">
            <div className="flex flex-col space-y-3">
                {modes.map(mode => {
                    const isDisabled = (mode.id === 'tutor' || mode.id === 'exam') && !isCurriculumLoaded;
                    const isActive = currentMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            onClick={() => onModeChange(mode.id)}
                            disabled={isDisabled}
                            className={`group relative w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center
                                ${isActive ? 'bg-cyan-500/20 border-cyan-500' : 'bg-gray-700/50 border-gray-700'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500/10 hover:border-cyan-500/50'}
                                border
                            `}
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isActive ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-cyan-300'}`}>
                                <mode.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{mode.name}</p>
                                <p className="text-xs text-gray-400">{mode.description}</p>
                            </div>
                             {isDisabled && (
                                <div className="absolute -top-4 right-0 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    Upload curriculum to unlock
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatModeSelector;
