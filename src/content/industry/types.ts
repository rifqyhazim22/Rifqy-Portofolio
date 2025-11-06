import type { IndustryDetail, LinkCard } from "@/i18n/types";

export interface InteractivePlaybook {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  wins: string[];
  steps: Array<{ title: string; body: string }>;
  resources: LinkCard[];
}

export type TrainingChallengeType =
  | "decision-tree"
  | "drag-drop"
  | "quiz"
  | "sandbox";

export interface TrainingGameLevel {
  id: string;
  title: string;
  summary: string;
  objective: string;
  xp: number;
  challengeType: TrainingChallengeType;
  npcHints: string[];
  resources: LinkCard[];
}

export interface TrainingGameReward {
  id: string;
  label: string;
  description: string;
}

export interface TrainingGame {
  playbookId: string;
  storyline: string;
  bossChallenge: string;
  rewards: TrainingGameReward[];
  levels: TrainingGameLevel[];
}

export interface IndustryOverview {
  title: string;
  intro: string;
  playbooks: LinkCard[];
  learningHeading: string;
  learningDescription: string;
  learningCards: Array<{ id: string; title: string; points: Array<{ title: string; body: string }> }>;
}

export interface LearningHubContent {
  title: string;
  intro: string;
  subtitle: string;
  tracks: Array<{
    id: string;
    title: string;
    description: string;
    modules: Array<{ title: string; duration: string; summary: string }>;
  }>;
  cta: { label: string; href: string };
}

export interface IndustryContent {
  overview: IndustryOverview;
  interactive: {
    heading: string;
    description: string;
    playbooks: InteractivePlaybook[];
  };
  details: Record<string, IndustryDetail>;
  learningHub: LearningHubContent;
  trainingGames: TrainingGame[];
}
