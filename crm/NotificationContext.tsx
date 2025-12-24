import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-right-10 fade-in
              ${notification.type === 'success' ? 'bg-white/90 dark:bg-[#1a1a1a]/90 border-green-500 text-green-700 dark:text-green-400' : ''}
              ${notification.type === 'error' ? 'bg-white/90 dark:bg-[#1a1a1a]/90 border-red-500 text-red-700 dark:text-red-400' : ''}
              ${notification.type === 'info' ? 'bg-white/90 dark:bg-[#1a1a1a]/90 border-blue-500 text-blue-700 dark:text-blue-400' : ''}
              ${notification.type === 'warning' ? 'bg-white/90 dark:bg-[#1a1a1a]/90 border-orange-500 text-orange-700 dark:text-orange-400' : ''}
            `}
          >
            <span className="material-symbols-outlined text-xl">
              {notification.type === 'success' && 'check_circle'}
              {notification.type === 'error' && 'error'}
              {notification.type === 'info' && 'info'}
              {notification.type === 'warning' && 'warning'}
            </span>
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};