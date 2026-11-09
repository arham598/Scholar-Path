export type NotificationType = 
  | 'deadline_urgent'       // Deadline within 7 days
  | 'matching_scholarship'  // New scholarship matching profile interests/country
  | 'document_reminder'     // Missing document alert
  | 'system';               // System or verification update

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  scholarshipId?: string;
  scholarshipName?: string;
  destinationFlag?: string;
  deadline?: string;
  daysRemaining?: number;
  read: boolean;
  createdAt: string;
  actionTab?: 'deadlines' | 'finder' | 'documents' | 'assistant';
  badge?: string;
}

export interface ToastItem extends AppNotification {
  duration?: number; // milliseconds before auto-dismiss
}
