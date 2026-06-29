export type Language = 'en' | 'ar';

export type UserRole = 'Parent' | 'Doctor' | 'Therapist' | 'Admin' | 'Child';

export interface GeneticReport {
  id: string;
  patientName: string;
  laboratory?: string;
  mthfrStatus: 'Wild Type (Normal)' | 'Heterozygous (C677T)' | 'Homozygous mutant (C677T/A1298C)';
  mthfrImpact: string;
  vdrStatus: 'Ff (Normal Expression)' | 'ff (Reduced Vitamin D Receptor)' | 'FF (Enhanced Expression)';
  vdrImpact: string;
  hlaStatus: 'HLA-DQ2/DQ8 Negative' | 'HLA-DQ2 Positive' | 'HLA-DQ8 Positive';
  hlaImpact: string;
  dietRecommendations: string[];
  supplementGuidance: string[];
  unsupportedFoods: string[];
  mealPlan: { day: string; meals: string[] }[];
}

export interface DailyBehaviorLog {
  id: string;
  date: string;
  mood: 'excellent' | 'good' | 'neutral' | 'unsettled' | 'distressed';
  sleepHours: number;
  mealsLogged: ('breakfast' | 'lunch' | 'dinner' | 'snacks')[];
  meltdownSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  therapyMinutes: number;
  medicationCompliance: boolean;
  notes: string;
  meltdownRiskScore: number; // 0-100
}

export interface CareNote {
  id: string;
  authorName: string;
  authorRole: 'Doctor' | 'Therapist' | 'Parent';
  content: string;
  timestamp: string;
  category: 'General' | 'Medical' | 'Dietary' | 'Therapy' | 'Security';
  approvedByDoctor: boolean;
}

export interface SecurityAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface GameScore {
  gameName: 'Memory Match' | 'Emotion Explorer';
  date: string;
  score: number;
  accuracy: number; // percentage
  durationSeconds: number;
}

export interface Notification {
  id: string; // mapped from backend _id
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning' | 'ai_insight';
  relatedTo?: 'patient' | 'nutrition' | 'behavior' | 'game' | 'system';
  relatedId?: string;
  read: boolean;
  createdAt: string;
}
