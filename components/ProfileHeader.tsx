
import React from 'react';
import { UserProfile } from '../types';
import { TrophyIcon } from './icons';

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const xpPercentage = (profile.xp / profile.xpToNextLevel) * 100;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-cyan-300">Agent {profile.name}</h2>
        <div className="flex items-center bg-yellow-400/10 text-yellow-300 font-bold py-1 px-3 rounded-full text-lg">
          <TrophyIcon className="w-6 h-6 mr-2" />
          Level {profile.level}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-300">
          <span>Progress to Next Level</span>
          <span>{profile.xp} / {profile.xpToNextLevel} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
