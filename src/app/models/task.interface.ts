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
  name: string;
  totalTimeSeconds: number;
  schnitzel: number;
  kartoffel: number;
  completedTasksCount: number;
}
