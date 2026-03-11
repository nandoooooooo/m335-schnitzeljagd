export interface Task {
  id: number;
  title: string;
  description: string;
  ionicIconName: string;
  relativeUrl: string;
  timeUntilPenalty: string;
  timeElapsed?: number;
  actualTimeSpent?: string;
  status: 'active' | 'completed' | 'locked';
  hint: string;
}

export interface ProgressStats {
  schnitzel: number;
  kartoffel: number;
}

export interface LeaderboardEntry {
  timestamp: number;
  totalTimeSeconds: number;
  schnitzel: number;
  kartoffel: number;
  completedTasksCount: number;
}
