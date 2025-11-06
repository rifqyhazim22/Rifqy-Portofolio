import type { TrainingGame, TrainingGameLevel } from "@/content/industry/types";

export type MissionStatus = "locked" | "active" | "completed";

export interface GameProgressSnapshot {
  playbookId: string;
  status: MissionStatus;
  xp: number;
  streak: number;
  completedLevels: string[];
  claimedRewards: string[];
}

export type { TrainingGame, TrainingGameLevel };
