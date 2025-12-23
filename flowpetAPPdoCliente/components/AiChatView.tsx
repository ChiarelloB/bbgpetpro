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

export const AiChatView: React.FC<Ai