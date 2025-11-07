"use client";

import { useEffect, useMemo, useState } from "react";
import BaseLink from "@/components/BaseLink";
import NextSteps from "@/components/NextSteps";
import type {
  IndustryOverview,
  InteractivePlaybook,
  LearningHubContent,
  TrainingGame,
} from "@/content/industry/types";
import type { NavLabelKey } from "@/data/navLinks";
import GamePanel from "./GamePanel";
import ProgressSummary from "./ProgressSummary";
import type { GameProgressSnapshot, MissionStatus } from "./types";

interface PlaybooksExperienceProps {
  overview: IndustryOverview;
  interactive: {
    heading: string;
    description: string;
    playbooks: InteractivePlaybook[];
  };
  learningHub: LearningHubContent;
  trainingGames: TrainingGame[];
  nextStepsHeading: string;
  navLabels: Record<NavLabelKey, string>;
}

interface ProgressResponse {
  playbookId: string;
  status: MissionStatus;
  xp: number;
  streak: number;
  completedLevels: string[];
  claimedRewards: string[];
  state?: Record<string, unknown> | null;
}

export function PlaybooksExperience({
  overview,
  interactive,
  learningHub,
  trainingGames,
  nextStepsHeading,
  navLabels,
}: PlaybooksExperienceProps) {
  const [progress, setProgress] = useState<GameProgressSnapshot[]>(() =>
    trainingGames.map((game, index) => ({
      playbookId: game.playbookId,
      status: index === 0 ? "active" : "locked",
      xp: index === 0 ? Math.floor((game.levels[0]?.xp ?? 0) / 2) : 0,
      streak: index === 0 ? 1 : 0,
      completedLevels: index === 0 && game.levels.length ? [game.levels[0].id] : [],
      claimedRewards: [],
      state: { lives: 3, levelStates: {} },
    })),
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const responses = await Promise.all(
          trainingGames.map(async (game) => {
            const response = await fetch(`/api/playbooks/${game.playbookId}/progress`, {
              cache: "no-store",
            });

            if (!response.ok) {
              return null;
            }

            return (await response.json()) as ProgressResponse;
          }),
        );

        if (cancelled) return;

        const hydrated = responses.filter(Boolean) as ProgressResponse[];
        if (hydrated.length) {
          setProgress((current) =>
            current.map((snapshot) => {
              const incoming = hydrated.find((item) => item.playbookId === snapshot.playbookId);
              return incoming
                ? {
                    playbookId: incoming.playbookId,
                    status: incoming.status,
                    xp: incoming.xp,
                    streak: incoming.streak,
                    completedLevels: incoming.completedLevels,
                    claimedRewards: incoming.claimedRewards,
                    state: incoming.state ?? { lives: 3, levelStates: {} },
                  }
                : snapshot;
            }),
          );
        }
      } catch (error) {
        console.error("Gagal memuat progres playbook", error);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [trainingGames]);

  useEffect(() => {
    setProgress((current) =>
      trainingGames.map((game, index) => {
        const existing = current.find((item) => item.playbookId === game.playbookId);
        return (
          existing ?? {
            playbookId: game.playbookId,
            status: index === 0 ? "active" : "locked",
            xp: 0,
            streak: 0,
            completedLevels: [],
            claimedRewards: [],
            state: { lives: 3, levelStates: {} },
          }
        );
      }),
    );
  }, [trainingGames]);

  const totalLevels = useMemo(
    () => trainingGames.reduce((total, game) => total + game.levels.length, 0),
    [trainingGames],
  );

  return (
    <div className="playbooks">
      <section className="playbooks__hero" data-animate>
        <h1 className="h1">{overview.title}</h1>
        <p className="sub">{overview.intro}</p>
        <div className="playbooks__hero-meta">
          <span>{trainingGames.length} playbook</span>
          <span>{totalLevels} level interaktif</span>
        </div>
        <div className="playbooks__hero-actions">
          {trainingGames.length > 0 ? (
            <BaseLink
              className="pill hero__action hero__action--primary"
              href={`/playbooks/${trainingGames[0].playbookId}/arena`}
            >
              Mulai Latihan
            </BaseLink>
          ) : null}
          <BaseLink className="pill" href={learningHub.cta.href}>
            {learningHub.cta.label}
          </BaseLink>
        </div>
      </section>

      <ProgressSummary games={trainingGames} progress={progress} />

      <section className="playbooks__grid" data-animate>
        <div className="grid grid-3">
          {overview.playbooks.map((item) => (
            <BaseLink key={item.href} className="card playbooks__card" href={item.href}>
              <div className="k">{item.title}</div>
              <div className="sub">{item.sub}</div>
            </BaseLink>
          ))}
        </div>
      </section>

      <section className="playbooks__interactive" data-animate>
        <h2 className="h2">{interactive.heading}</h2>
        <p className="sub">{interactive.description}</p>
        <div className="grid grid-3">
          {interactive.playbooks.map((playbook) => (
            <div key={playbook.id} className="card playbooks__interactive-card">
              <div className="playbooks__tag">{playbook.tags.join(" · ")}</div>
              <div className="k">{playbook.title}</div>
              <p className="sub">{playbook.summary}</p>
              <div className="playbooks__wins">
                {playbook.wins.map((win) => (
                  <span key={win}>{win}</span>
                ))}
              </div>
              <details className="playbooks__details">
                <summary>Langkah kilat</summary>
                <div className="playbooks__steps">
                  {playbook.steps.map((step) => (
                    <div key={step.title} className="playbooks__step">
                      <strong>{step.title}</strong>
                      <p className="sub">{step.body}</p>
                    </div>
                  ))}
                </div>
              </details>
              <div className="playbooks__resources">
                {playbook.resources.map((resource) => (
                  <BaseLink key={resource.href} href={resource.href} className="pill">
                    {resource.title}
                  </BaseLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="playbooks__game-panels">
        {trainingGames.map((game) => (
          <GamePanel
            key={game.playbookId}
            game={game}
            progress={progress.find((item) => item.playbookId === game.playbookId)}
          />
        ))}
      </div>

      <section className="playbooks__learning" data-animate>
        <h2 className="h2">{overview.learningHeading}</h2>
        <p className="sub">{overview.learningDescription}</p>
        <div className="grid grid-3">
          {overview.learningCards.map((card) => (
            <div key={card.id} className="card playbooks__lesson">
              <div className="k">{card.title}</div>
              <div className="playbooks__lesson-points">
                {card.points.map((point) => (
                  <div key={point.title} className="sub">
                    <strong>{point.title}</strong> {point.body}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="playbooks__learning--tracks" data-animate>
        <h2 className="h2">Learning Tracks</h2>
        <div className="grid grid-3">
          {learningHub.tracks.map((track) => (
            <div key={track.id} className="card learning__track">
              <div className="k">{track.title}</div>
              <p className="sub">{track.description}</p>
              <div className="learning__modules">
                {track.modules.map((module) => (
                  <div key={module.title} className="learning__module">
                    <div className="learning__module-header">
                      <span className="learning__module-title">{module.title}</span>
                      <span className="learning__module-duration">{module.duration}</span>
                    </div>
                    <div className="sub">{module.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hr" data-animate />
      <div data-animate>
        <NextSteps current="industry" heading={nextStepsHeading} navLabels={navLabels} />
      </div>
    </div>
  );
}

export default PlaybooksExperience;
