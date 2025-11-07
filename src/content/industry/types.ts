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

export interface DecisionTreeChallengeOption {
  id: string;
  label: string;
  outcome: "success" | "fail";
  feedback: string;
  xpBonus?: number;
}

export interface DecisionTreeChallenge {
  type: "decision-tree";
  scenario: string;
  question: string;
  options: DecisionTreeChallengeOption[];
}

export interface QuizChallengeOption {
  id: string;
  label: string;
  explanation: string;
}

export interface QuizChallenge {
  type: "quiz";
  question: string;
  options: QuizChallengeOption[];
  correctOptionId: string;
}

export interface DragDropChallengeItem {
  id: string;
  label: string;
  description?: string;
}

export interface DragDropChallenge {
  type: "drag-drop";
  prompt: string;
  items: DragDropChallengeItem[];
  correctOrder: string[];
}

export interface SandboxChallenge {
  type: "sandbox";
  instructions: string;
  aiPrompt: string;
  checklist: string[];
}

export type LevelChallenge =
  | DecisionTreeChallenge
  | QuizChallenge
  | DragDropChallenge
  | SandboxChallenge;

export interface TrainingGameLevel {
  id: string;
  title: string;
  summary: string;
  objective: string;
  xp: number;
  challengeType: TrainingChallengeType;
  npcHints: string[];
  resources: LinkCard[];
  challenge: LevelChallenge;
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
