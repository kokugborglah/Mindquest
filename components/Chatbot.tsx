import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { sendMessage } from '../services/geminiService';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

interface ChatbotProps {
  isCurriculumLoaded: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isCurriculumLoaded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const getInitialMessage = () => isCurriculumLoaded
    ? "Hey Jeremy! Your curriculum is loaded. Ready for a quiz? Or ask me to explain something from school!"
    : "Hey Jeremy! I'm Sparky, your guide. Ask me for tips or just say hi!";

  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: getInitialMessage() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    const curriculumStatusMessage: ChatMessage = {
        sender: 'bot',
        text: isCurriculumLoaded 
            ? "Great news! Your new curriculum has been loaded. I'm ready for your questions! 🚀"
            : "Just letting you know, the curriculum has been cleared."
    };
    setMessages(prev => [...prev, curriculumStatusMessage]);

  }, [isCurriculumLoaded]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessage(userInput);
      const newBotMessage: ChatMessage = { sender: 'bot', text: botResponse };
      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'bot', text: "Something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg">
      <div className={`bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${isOpen ? 'h-[600px]' : 'h-16'}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-16 flex justify-between items-center px-6 text-white"
        >
          <span className="text-xl font-bold">Chat with Sparky</span>
          {isOpen ? <ChevronDownIcon className="w-6 h-6" /> : <ChevronUpIcon className="w-6 h-6" />}
        </button>

        {isOpen && (
          <div className="flex flex-col h-[calc(100%-4rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-black text-white text-lg flex-shrink-0">S</div>}
                  <div className={`max-w-md rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-cyan-500 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                    <p className="text-base">{msg.text}</p>
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                   <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-black text-white text-lg flex-shrink-0">S</div>
                   <div className="bg-gray-700 rounded-2xl px-4 py-2 rounded-bl-none">
                       <div className="flex items-center space-x-1">
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                           <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                       </div>
                   </div>
                 </div>
               )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-600 text-white placeholder-gray-400 rounded-full py-3 px-5 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
