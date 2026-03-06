export type LatLng = {
  lat: number;
  lng: number;
};

export type QuestType = "point_to_point" | "collector" | "scavenger";
export type QuestDifficulty = "easy" | "medium" | "hard";
export type QuestStatus = "active" | "completed" | "abandoned";

export type MomentumDay = {
  date: string;
  didRun: boolean;
  usedRestCredit: boolean;
  streakBroken: boolean;
};

export type UserMomentum = {
  currentStreak: number;
  longestStreak: number;
  restCredits: number;
  maxRestCredits: number;
  recentDays: MomentumDay[];
};

export type QuestWithProgress = {
  id: number;
  name: string;
  description: string;
  flavorText: string | null;
  type: QuestType;
  difficulty: QuestDifficulty;
  xpReward: number;
  restCreditReward: number;
  totalCheckpoints: number;
  completedCheckpoints: number;
  status: QuestStatus | "available";
};

export type CheckpointDetail = {
  id: number;
  name: string;
  description: string | null;
  hint: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  sortOrder: number;
  isRevealed: boolean;
  isCompleted: boolean;
};

export type QuestDetail = QuestWithProgress & {
  checkpoints: CheckpointDetail[];
};

export type MapCheckpoint = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isCompleted: boolean;
};

export type MapQuest = {
  id: number;
  name: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  status: QuestStatus | "available";
  checkpoints: MapCheckpoint[];
  routePolylines: string[];
};

export type MapData = {
  quests: MapQuest[];
};

export type StravaTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type StravaAthlete = {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  map: {
    summary_polyline: string;
  };
};
