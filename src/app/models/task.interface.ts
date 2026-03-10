export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'active' | 'completed' | 'locked';
  time?: string;
  points?: number;
  isLocked: boolean;
}

export interface ProgressStats {
  schnitzel: number;
  kartoffel: number;
  punkte: number;
}
