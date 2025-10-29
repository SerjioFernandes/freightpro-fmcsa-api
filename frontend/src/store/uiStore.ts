import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  notifications: Notification[];
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  notifications: [],
  isModalOpen: false,
  modalContent: null,

  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(7);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}));




