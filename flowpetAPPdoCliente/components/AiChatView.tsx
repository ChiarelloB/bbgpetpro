import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, X, Loader2 } from 'lucide-react';
import { PetProfile } from '../types';
import { getGeminiModel } from '../lib/gemini';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AiChatViewProps {
  currentPet: PetProfile | undefined;
  onClose: () => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({ currentPet, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: `Olá! Sou seu assistente pet IA. ${currentPet ? `Como posso ajudar você com o ${currentPet.name} hoje?` : 'Como posso ajudar você e seu pet hoje?'}`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const model = getGeminiModel();
      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const contextPrompt = currentPet
        ? `Considere que sou o tutor do pet ${currentPet.name}, um ${currentPet.breed} (${currentPet.species}). ${inputText}`
        : inputText;

      const result = await chat.sendMessage(contextPrompt);
      const response = await result.response;
      const text = response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente em instantes."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-dark-900 sm:relative sm:z-0 sm:h-full flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Assistente Pet IA</h2>
            <p className="text-white/60 text-xs uppercase font-black tracking-widest">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'model' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white/40'
              }`}>
              {msg.role === 'model' ? <Bot size={18} /> : <UserIcon size={18} />}
            </div>

            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'model'
                ? 'bg-white/5 text-white/90 rounded-tl-none border border-white/5 shadow-xl'
                : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-dark-800/50 backdrop-blur-xl border-t border-white/5 shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder="Pergunte algo sobre seu pet..."
            className="w-full bg-white/5 text-white p-4 pr-14 rounded-2xl border border-white/10 outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2 top-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:grayscale"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-[10px] text-white/20 text-center mt-3 uppercase font-bold tracking-widest">
          Consulte sempre um veterinário para emergências
        </p>
      </div>
    </div>
  );
};