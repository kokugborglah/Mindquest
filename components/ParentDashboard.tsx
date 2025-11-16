import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';
import { UserProfile, Quest, DailyProgress, Badge } from '../types';
import { ALL_BADGES } from '../constants';
import Badges from './Badges';
import { TrophyIcon, UploadIcon, TrashIcon } from './icons';

interface ParentDashboardProps {
  profile: UserProfile;
  quests: Quest[];
  progressData: DailyProgress[];
  onCurriculumUpload: (content: string, fileName: string) => void;
  onClearCurriculum: () => void;
  curriculumFileName: string | null;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ profile, quests, progressData, onCurriculumUpload, onClearCurriculum, curriculumFileName }) => {
  const completedCount = quests.filter(q => q.isCompleted).length;
  const totalQuests = quests.length;
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name;

    const cleanup = () => {
        setIsUploading(false);
        event.target.value = '';
    };

    try {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (!e.target?.result) {
                    alert('Failed to read file.');
                    cleanup();
                    return;
                }
                try {
                    const data = new Uint8Array(e.target.result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument({ data }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n\n';
                    }
                    onCurriculumUpload(fullText.trim(), fileName);
                } catch (pdfError) {
                    console.error('Error parsing PDF:', pdfError);
                    alert('Could not read the PDF file. It might be corrupted or protected.');
                } finally {
                    cleanup();
                }
            };
            reader.onerror = () => {
                alert('Error reading file.');
                cleanup();
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onCurriculumUpload(content, fileName);
                cleanup();
            };
            reader.onerror = () => {
                alert('Error reading file.');
                cleanup();
            };
            reader.readAsText(file);
        } else {
            alert('Unsupported file type. Please upload a PDF, TXT, or MD file.');
            cleanup();
        }
    } catch (error) {
        console.error('Error processing file:', error);
        alert('There was an error processing your file.');
        cleanup();
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700">
      <h2 className="text-3xl font-bold text-cyan-300 mb-6">Parent Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Jeremy's Level</p>
          <p className="text-3xl font-bold text-yellow-300 flex items-center justify-center">
            <TrophyIcon className="w-8 h-8 mr-2" />
            {profile.level}
          </p>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Total XP Gained</p>
          <p className="text-3xl font-bold text-white">{profile.xp + (profile.level - 1) * 100}</p>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-400">Quests Completed Today</p>
          <p className="text-3xl font-bold text-white">{completedCount} / {totalQuests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Progress</h3>
          <div className="w-full h-72 bg-gray-800 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" />
                <YAxis allowDecimals={false} stroke="#A0AEC0" />
                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }} />
                <Legend />
                <Bar dataKey="completed" fill="#4FD1C5" name="Quests Completed"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-white mb-4">Badges Earned</h3>
            <div className="w-full h-72 bg-gray-800 p-4 rounded-lg overflow-y-auto">
                <Badges earnedBadges={profile.badges} allBadges={ALL_BADGES} />
            </div>
        </div>
        <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Curriculum Hub</h3>
            <div className="bg-gray-800 p-6 rounded-lg">
                {curriculumFileName ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Current Curriculum</p>
                            <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">{curriculumFileName}</p>
                        </div>
                        <button 
                            onClick={onClearCurriculum} 
                            className="flex-shrink-0 bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold p-2 rounded-full transition-colors"
                            aria-label="Remove curriculum"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-center text-gray-400 mb-4">Upload Jeremy's curriculum (PDF, TXT, MD) to enable AI-powered quizzes and real-world examples.</p>
                        <label htmlFor="curriculum-upload" className={`flex items-center justify-center w-full max-w-xs mx-auto bg-purple-600 ${!isUploading && 'hover:bg-purple-700'} text-white font-semibold py-2 px-4 rounded-lg transition-colors ${isUploading ? 'cursor-wait bg-purple-800' : 'cursor-pointer'}`}>
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5 mr-2" />
                                    <span>Upload File</span>
                                </>
                            )}
                        </label>
                        <input id="curriculum-upload" type="file" className="hidden" onChange={handleFileChange} accept=".txt,.md,.text,.pdf" disabled={isUploading} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;