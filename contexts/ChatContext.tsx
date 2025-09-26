import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatContextType, ChatMessage, ChatSession, ChatUser } from '@/types/chat';
import { defaultSession, aiUser, humanUser, getRandomAIResponse } from '@/data/chat';
import { geminiService, ChatContext as GeminiChatContext } from '@/services/geminiService';

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  isConnected: boolean;
  isChatVisible: boolean;
}

type ChatAction =
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession | null }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { messageId: string; status: ChatMessage['status'] } }
  | { type: 'SET_CHAT_VISIBLE'; payload: boolean };

const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isTyping: false,
  isConnected: true,
  isChatVisible: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    
    case 'ADD_MESSAGE':
      if (!state.currentSession) return state;
      
      const updatedSession = {
        ...state.currentSession,
        messages: [...state.currentSession.messages, action.payload],
        lastActivity: new Date(),
      };
      
      return {
        ...state,
        currentSession: updatedSession,
        sessions: state.sessions.map(session =>
          session.id === updatedSession.id ? updatedSession : session
        ),
      };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'UPDATE_MESSAGE_STATUS':
      if (!state.currentSession) return state;
      
      const sessionWithUpdatedMessage = {
        ...state.currentSession,
        messages: state.currentSession.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, status: action.payload.status }
            : msg
        ),
      };
      
      return {
        ...state,
        currentSession: sessionWithUpdatedMessage,
        sessions: state.sessions.map(session =>
          session.id === sessionWithUpdatedMessage.id ? sessionWithUpdatedMessage : session
        ),
      };
    
    case 'SET_CHAT_VISIBLE':
      return { ...state, isChatVisible: action.payload };
    
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load chat data from AsyncStorage on mount
  useEffect(() => {
    loadChatData();
  }, []);

  // Save chat data whenever sessions change
  useEffect(() => {
    if (state.sessions.length > 0) {
      saveChatData();
    }
  }, [state.sessions]);

  const loadChatData = async () => {
    try {
      const savedSessions = await AsyncStorage.getItem('chat_sessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [defaultSession];
      
      // Convert date strings back to Date objects
      const processedSessions = sessions.map((session: any) => ({
        ...session,
        lastActivity: new Date(session.lastActivity),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      
      dispatch({ type: 'SET_SESSIONS', payload: processedSessions });
      dispatch({ type: 'SET_CURRENT_SESSION', payload: processedSessions[0] || null });
    } catch (error) {
      console.error('Failed to load chat data:', error);
      // Fall back to default session
      dispatch({ type: 'SET_SESSIONS', payload: [defaultSession] });
      dispatch({ type: 'SET_CURRENT_SESSION', payload: defaultSession });
    }
  };

  const saveChatData = async () => {
    try {
      await AsyncStorage.setItem('chat_sessions', JSON.stringify(state.sessions));
    } catch (error) {
      console.error('Failed to save chat data:', error);
    }
  };

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = async (content: string, context?: string, geminiContext?: GeminiChatContext): Promise<void> => {
    if (!state.currentSession || !content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content: content.trim(),
      userId: humanUser.id,
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      context: context,
    };

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // Update message status to sent
    setTimeout(() => {
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { messageId: userMessage.id, status: 'sent' } });
    }, 100);

    // Show typing indicator
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      // Get AI response from Gemini
      const aiResponseText = await geminiService.sendMessage(content.trim(), geminiContext);

      dispatch({ type: 'SET_TYPING', payload: false });

      // Generate AI response
      const aiResponse: ChatMessage = {
        id: generateMessageId(),
        content: aiResponseText,
        userId: aiUser.id,
        timestamp: new Date(),
        type: 'text',
        status: 'delivered',
        context: context,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });
    } catch (error) {
      console.error('Error getting AI response:', error);
      dispatch({ type: 'SET_TYPING', payload: false });

      // Fallback to mock response if Gemini fails
      const fallbackResponse: ChatMessage = {
        id: generateMessageId(),
        content: getRandomAIResponse(content),
        userId: aiUser.id,
        timestamp: new Date(),
        type: 'text',
        status: 'delivered',
        context: context,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: fallbackResponse });
    }
  };

  const createNewSession = (): void => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Chat ${state.sessions.length + 1}`,
      messages: [],
      lastActivity: new Date(),
      participants: [humanUser, aiUser],
    };
    
    const updatedSessions = [newSession, ...state.sessions];
    dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
  };

  const loadSession = (sessionId: string): void => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (session) {
      dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    }
  };

  const clearCurrentSession = (): void => {
    if (state.currentSession) {
      const clearedSession = {
        ...state.currentSession,
        messages: [],
        lastActivity: new Date(),
      };
      
      dispatch({ type: 'SET_CURRENT_SESSION', payload: clearedSession });
      
      const updatedSessions = state.sessions.map(session =>
        session.id === clearedSession.id ? clearedSession : session
      );
      dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
    }
  };

  const showChat = (): void => {
    dispatch({ type: 'SET_CHAT_VISIBLE', payload: true });
  };

  const hideChat = (): void => {
    dispatch({ type: 'SET_CHAT_VISIBLE', payload: false });
  };

  const contextValue: ChatContextType = {
    currentSession: state.currentSession,
    sessions: state.sessions,
    isTyping: state.isTyping,
    isConnected: state.isConnected,
    isChatVisible: state.isChatVisible,
    sendMessage,
    createNewSession,
    loadSession,
    clearCurrentSession,
    showChat,
    hideChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}