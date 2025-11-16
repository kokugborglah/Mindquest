
import React from 'react';
import { Badge } from '../types';

interface BadgesProps {
    earnedBadges: string[];
    allBadges: Badge[];
}

const Badges: React.FC<BadgesProps> = ({ earnedBadges, allBadges }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {allBadges.map(badge => {
                const isEarned = earnedBadges.includes(badge.id);
                return (
                    <div key={badge.id} className="group relative flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isEarned ? 'bg-yellow-400/20' : 'bg-gray-700'}`}>
                            <badge.icon className={`w-8 h-8 ${isEarned ? 'text-yellow-300' : 'text-gray-500'}`} />
                        </div>
                        <span className={`mt-2 text-xs font-semibold ${isEarned ? 'text-white' : 'text-gray-500'}`}>{badge.name}</span>
                        <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-gray-700">
                            <p className="font-bold">{badge.name}</p>
                            <p>{badge.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Badges;
