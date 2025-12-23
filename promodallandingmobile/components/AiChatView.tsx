import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PetProfile } from '../types';

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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: currentPet 
        ? `Olá! Sou o assistente virtual do ${currentPet.name}. Como posso ajudar com a saúde ou bem-estar del${currentPet.stats.sex === 'female' ? 'a' : 'e'} hoje?`
        : 'Olá! Sou seu assistente veterinário virtual. Como posso ajudar?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct system instruction with pet context
      let systemInstruction = "Você é um assistente veterinário especializado, amigável e prestativo do app 'Flow Pet Pro'.";
      if (currentPet) {
        systemInstruction += `
          Você está respondendo dúvidas sobre um pet específico com os seguintes dados:
          - Nome: ${currentPet.name}
          - Raça: ${currentPet.breed}
          - Idade: ${currentPet.age} anos
          - Peso: ${currentPet.stats.weight}kg
          - Sexo: ${currentPet.stats.sex}
          - Alergias/Condições: ${currentPet.alerts.map(a => a.label).join(', ') || 'Nenhuma conhecida'}
          - Vacinas: ${currentPet.vaccines.map(v => `${v.name} (${v.status})`).join(', ')}
          
          Use essas informações para dar conselhos personalizados, mas SEMPRE lembre o usuário de consultar um veterinário real para diagnósticos graves. Seja conciso e use formatação markdown simples se necessário.
        `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage.text,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const text = response.text;
      if (text) {
        const aiMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: text 
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "Desculpe, tive um problema ao processar sua pergunta. Tente novamente mais tarde." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-[slideUp_0.3s_ease-out]">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-neon">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Veterinário IA</h3>
            <p className="text-xs text-indigo-300">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white">
            <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-white/10' : 'bg-indigo-600/20 text-indigo-400'
            }`}>
                {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-glass-bg border border-glass-border text-white/90 rounded-tl-none'
            }`}>
                {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} />
                 </div>
                 <div className="bg-glass-bg border border-glass-border p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150"></div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <div className="relative flex items-center">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre vacinas, sintomas..." 
                className="w-full bg-glass-bg border border-glass-border rounded-2xl pl-4 pr-12 py-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};