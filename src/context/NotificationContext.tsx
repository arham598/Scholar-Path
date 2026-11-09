import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppNotification, ToastItem, NotificationType } from '../types/notification';
import { Scholarship, StudentProfile, SavedScholarship } from '../types/scholarship';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';

interface NotificationContextType {
  notifications: AppNotification[];
  toasts: ToastItem[];
  unreadCount: number;
  browserPermission: NotificationPermission;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt' | 'read'>) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  evaluateNotifications: (scholarships: Scholarship[], profile: StudentProfile, saved: SavedScholarship[]) => void;
  triggerSampleDeadlineToast: () => void;
  triggerSampleMatchToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'scholarpath_notifications_history';
const PROCESSED_ALERTS_KEY = 'scholarpath_processed_alerts_set';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const hasEvaluatedInitialRef = useRef(false);

  // Load notifications from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    } else {
      // Seed with initial realistic contextual alerts
      const initialSeed: AppNotification[] = [
        {
          id: 'notif-seed-deadline',
          type: 'deadline_urgent',
          title: 'Deadline Approaching (Within 7 Days)',
          message: 'The DSU Regional Scholarship Italy closing date is approaching in 5 days! Complete your ISEE Parificato documentation.',
          scholarshipId: 'dsu-toscana-it',
          scholarshipName: 'DSU Regional Scholarship Italy',
          destinationFlag: '🇮🇹',
          deadline: '2026-09-06',
          daysRemaining: 5,
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          actionTab: 'deadlines',
          badge: '5 Days Left',
        },
        {
          id: 'notif-seed-match',
          type: 'matching_scholarship',
          title: 'New Scholarship Match: Germany & AI',
          message: 'DAAD Helmut-Schmidt-Programme matches your profile interest in Master in Artificial Intelligence and Germany.',
          scholarshipId: 'daad-helmut-schmidt-de',
          scholarshipName: 'DAAD Helmut-Schmidt-Programme',
          destinationFlag: '🇩🇪',
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          actionTab: 'finder',
          badge: 'Profile Match',
        },
      ];
      setNotifications(initialSeed);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSeed));
    }
  }, []);

  // Save notifications to local storage and sync with Firestore if signed in
  const persistNotifications = useCallback((updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    if (user && !('isDemo' in user)) {
      // Sync in Firestore background
      const userUid = user.uid;
      updated.slice(0, 10).forEach(async (notif) => {
        try {
          await setDoc(doc(db, 'users', userUid, 'notifications', notif.id), notif, { merge: true });
        } catch {
          // ignore background sync error
        }
      });
    }
  }, [user]);

  // Push native browser notification if granted
  const pushNativeBrowserNotification = useCallback((title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
        });
      } catch (err) {
        console.warn('Native notification error:', err);
      }
    }
  }, []);

  // Add toast to active queue
  const addToast = useCallback((toastData: Omit<ToastItem, 'id' | 'createdAt' | 'read'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newNotification: AppNotification = {
      ...toastData,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const newToast: ToastItem = {
      ...newNotification,
      duration: toastData.duration || 7000,
    };

    // Add to toast queue
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 simultaneous toasts

    // Add to notifications list
    setNotifications((prev) => {
      const updated = [newNotification, ...prev.filter((n) => n.id !== id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Native browser push notification
    pushNativeBrowserNotification(toastData.title, toastData.message);
  }, [pushNativeBrowserNotification]);

  // Dismiss a specific toast
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persistNotifications(updated);
  }, [notifications, persistNotifications]);

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    persistNotifications(updated);
  }, [notifications, persistNotifications]);

  const clearNotification = useCallback((id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    persistNotifications(updated);
    if (user && !('isDemo' in user)) {
      deleteDoc(doc(db, 'users', user.uid, 'notifications', id)).catch(() => {});
    }
  }, [notifications, persistNotifications, user]);

  const clearAllNotifications = useCallback(() => {
    persistNotifications([]);
  }, [persistNotifications]);

  // Request browser notification permission
  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          addToast({
            type: 'system',
            title: 'Push Notifications Enabled',
            message: 'ScholarPath will now alert you of urgent deadlines (within 7 days) and matching opportunities.',
            badge: 'Active',
            duration: 5000,
          });
        }
        return perm;
      } catch (err) {
        console.warn('Notification permission error', err);
        return 'denied';
      }
    }
    return 'denied';
  };

  // Evaluate notifications across scholarships, student profile interests, and saved deadlines
  const evaluateNotifications = useCallback((
    scholarships: Scholarship[],
    studentProfile: StudentProfile,
    savedScholarships: SavedScholarship[]
  ) => {
    if (!scholarships || scholarships.length === 0) return;

    // Get set of previously alerted keys to avoid spamming
    const processedRaw = localStorage.getItem(PROCESSED_ALERTS_KEY);
    const processedSet = new Set<string>(processedRaw ? JSON.parse(processedRaw) : []);

    const today = new Date();

    // 1. Check for Deadlines within 7 days
    savedScholarships.forEach((item) => {
      const deadline = new Date(item.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const alertKey = `deadline-7d-${item.scholarshipId}`;

      // Notify if within 7 days (and not expired past 0 days)
      if (diffDays >= 0 && diffDays <= 7 && !processedSet.has(alertKey)) {
        processedSet.add(alertKey);
        addToast({
          type: 'deadline_urgent',
          title: `Deadline Urgent: ${item.scholarshipName}`,
          message: `The application deadline is in ${diffDays === 0 ? 'today!' : `${diffDays} days`} (${new Date(item.deadline).toLocaleDateString()}). Ensure your documents and letters are finalized!`,
          scholarshipId: item.scholarshipId,
          scholarshipName: item.scholarshipName,
          deadline: item.deadline,
          daysRemaining: diffDays,
          actionTab: 'deadlines',
          badge: `${diffDays}d Left`,
          duration: 9000,
        });
      }
    });

    // Also check all active featured scholarships for 7-day deadlines
    scholarships.filter(s => !s.isExpired).forEach((s) => {
      const deadline = new Date(s.applicationClosingDate);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const alertKey = `closing-soon-${s.id}`;
      if (diffDays >= 0 && diffDays <= 7 && !processedSet.has(alertKey)) {
        processedSet.add(alertKey);
        addToast({
          type: 'deadline_urgent',
          title: `Closing Soon: ${s.name}`,
          message: `Applications for ${s.country} close in ${diffDays} days. Check eligibility and submit your portal application.`,
          scholarshipId: s.id,
          scholarshipName: s.name,
          destinationFlag: s.destinationFlag,
          deadline: s.applicationClosingDate,
          daysRemaining: diffDays,
          actionTab: 'deadlines',
          badge: `${diffDays}d Left`,
          duration: 9000,
        });
      }
    });

    // 2. Check for New Scholarships Matching Profile Interests
    const preferredCountries = (studentProfile.preferredCountries || []).map(c => c.toLowerCase());
    const desiredDegree = (studentProfile.desiredDegree || '').toLowerCase();

    scholarships.filter(s => !s.isExpired).forEach((s) => {
      const countryMatches = preferredCountries.includes(s.country.toLowerCase());
      const fieldsMatch = (s.targetFields || []).some(f => 
        desiredDegree.includes('computer') && f.toLowerCase().includes('computer') ||
        desiredDegree.includes('ai') && f.toLowerCase().includes('artificial') ||
        desiredDegree.includes('data') && f.toLowerCase().includes('data') ||
        desiredDegree.includes('software') && f.toLowerCase().includes('software') ||
        desiredDegree.includes('engineering') && f.toLowerCase().includes('engineering')
      );

      const alertKey = `match-${s.id}-${studentProfile.email || 'guest'}`;

      if ((countryMatches || fieldsMatch) && !processedSet.has(alertKey)) {
        processedSet.add(alertKey);
        addToast({
          type: 'matching_scholarship',
          title: `New Matching Opportunity: ${s.country}`,
          message: `${s.destinationFlag} ${s.name} aligns with your preference for ${s.country} and ${studentProfile.desiredDegree || 'your degree'}.`,
          scholarshipId: s.id,
          scholarshipName: s.name,
          destinationFlag: s.destinationFlag,
          actionTab: 'finder',
          badge: 'Match Found',
          duration: 8000,
        });
      }
    });

    localStorage.setItem(PROCESSED_ALERTS_KEY, JSON.stringify(Array.from(processedSet)));
  }, [addToast]);

  // Interactive Test Triggers for users to preview
  const triggerSampleDeadlineToast = () => {
    addToast({
      type: 'deadline_urgent',
      title: '🚨 Deadline Alert: Within 4 Days!',
      message: 'Türkiye Bursları Government Scholarship portal closes on February 20 (4 days remaining). Check your transcript and recommendation letters!',
      scholarshipId: 'turkiye-burslari-tr',
      scholarshipName: 'Türkiye Bursları Government Scholarships',
      destinationFlag: '🇹🇷',
      daysRemaining: 4,
      actionTab: 'deadlines',
      badge: '4 Days Left',
      duration: 8000,
    });
  };

  const triggerSampleMatchToast = () => {
    addToast({
      type: 'matching_scholarship',
      title: '✨ Opportunity Match: Italy & AI/CS',
      message: 'DSU Regional Scholarship in Tuscany matches your target degree in Artificial Intelligence with 100% tuition waiver and housing stipend.',
      scholarshipId: 'dsu-toscana-it',
      scholarshipName: 'DSU Regional Scholarship Italy',
      destinationFlag: '🇮🇹',
      actionTab: 'finder',
      badge: 'High Match',
      duration: 8000,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        browserPermission,
        requestBrowserPermission,
        addToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        evaluateNotifications,
        triggerSampleDeadlineToast,
        triggerSampleMatchToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
