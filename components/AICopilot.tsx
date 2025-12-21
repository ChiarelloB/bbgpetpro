import React, { useState, useRef, useEffect } from 'react';
// import { GoogleGenAI } from "@google/genai"; // Removed

import { useTheme } from '../ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const suggestions = [
  "Resumo do dia 📅",
  "Como aumentar vendas? 📈",
  "Dica de marketing 💡",
  "Estoque crítico 📦"
];

export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Olá! Sou o assistente inteligente do BBG CRM. Como posso ajudar você hoje?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeMode } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const textToSend = textOverride || inputText;

    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Use the centralized helper
      const { getGeminiModel } = await import('../src/lib/gemini');
      const model = getGeminiModel('gemini-1.5-flash');

      const chat = model.startChat({
        history: messages.filter(m => m.id !== 'welcome').map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
        systemInstruction: "Você é o Copiloto IA do BBG CRM PRO, um CRM para Pet Shops. Você é especialista em gestão veterinária, estoque, marketing para pet shops e cuidados animais. Suas respostas devem ser curtas, profissionais e úteis. Use emojis ocasionalmente. Se perguntarem sobre dados do sistema, explique que você tem acesso apenas a conhecimentos gerais por enquanto, mas pode dar dicas estratégicas."
      });

      const result = await chat.sendMessageStream(userMsg.text);

      let fullResponse = "";
      const modelMsgId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullResponse } : m));
        }
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Desculpe, tive um problema ao processar sua solicitação. Verifique sua chave de API.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto bg-white dark:bg-[#1a1a1a] w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 mb-4">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined">smart_toy</span>
              <div>
                <h3 className="font-bold text-sm leading-none">BBG CRM AI</h3>
                <p className="text-[10px] opacity-80">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#111]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white dark:bg-[#252525] text-slate-700 dark:text-gray-200 rounded-bl-none border border-slate-100 dark:border-gray-700'
                  }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#252525] rounded-xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-gray-700 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions & Input */}
          <div className="bg-white dark:bg-[#1a1a1a] border-t border-slate-100 dark:border-gray-800 shrink-0">
            {messages.length < 3 && !isTyping && (
              <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(undefined, s)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
              <input
                autoFocus
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-slate-100 dark:bg-[#252525] border-none rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="bg-primary text-white p-2 rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:bg-primary-hover hover:scale-105 transition-all flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>
    </div>
  );
};