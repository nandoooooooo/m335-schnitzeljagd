export interface Task {
  id: number;
  title: string;
  description: string;
  ionicIconName: string;
  relativeUrl: string;
  timeUntilPenalty: string;
  actualTimeSpent?: string;
  status: 'active' | 'completed' | 'locked';
  hint: string;
}

export interface ProgressStats {
  schnitzel: number;
  kartoffel: number;
}
