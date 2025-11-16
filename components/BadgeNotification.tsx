
import React, { useEffect, useState } from 'react';
import { Badge } from '../types';
import { TrophyIcon } from './icons';

interface BadgeNotificationProps {
    badge: Badge | null;
    onDismiss: () => void;
}

const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (badge) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                // Allow time for fade-out animation before dismissing
                setTimeout(onDismiss, 300);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [badge, onDismiss]);

    return (
        <div 
            aria-live="assertive"
            className={`fixed top-5 right-5 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        >
            {badge && (
                <div className="max-w-sm w-full bg-gray-800/80 backdrop-blur-md shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border border-yellow-400/50">
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                                    <TrophyIcon className="h-6 w-6 text-yellow-300" aria-hidden="true" />
                                </div>
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-white">Badge Unlocked!</p>
                                <p className="mt-1 text-sm text-gray-300">{badge.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BadgeNotification;
