import BaseLink from "@/components/BaseLink";
import type { TrainingGame } from "@/content/industry/types";
import type { GameProgressSnapshot } from "./types";

interface MissionDeckProps {
  games: TrainingGame[];
  progress: GameProgressSnapshot[];
}

export function MissionDeck({ games, progress }: MissionDeckProps) {
  return (
    <div className="playbooks__missions" data-animate>
      {games.map((game) => {
        const snapshot = progress.find((item) => item.playbookId === game.playbookId);
        const completedLevels = new Set(snapshot?.completedLevels ?? []);
        const activeLevelId =
          snapshot?.status === "completed"
            ? null
            : game.levels.find((level) => !completedLevels.has(level.id))?.id ?? null;

        return (
          <div key={game.playbookId} className="card playbooks__mission-card">
            <div className="playbooks__mission-header">
              <div className="k">{game.playbookId.replace(/-/g, " ")}</div>
              <BaseLink className="pill" href={`/playbooks/${game.playbookId}/arena`}>
                Masuk Arena
              </BaseLink>
            </div>
            <p className="sub">{game.storyline}</p>
            <div className="playbooks__mission-levels">
              {game.levels.map((level) => (
                <div
                  key={level.id}
                  className={`playbooks__mission-level${
                    completedLevels.has(level.id) ? " playbooks__mission-level--done" : ""
                  }${activeLevelId === level.id ? " playbooks__mission-level--active" : ""}`}
                >
                  <div>
                    <strong>{level.title}</strong>
                    <p className="sub">{level.summary}</p>
                  </div>
                  <div className="playbooks__mission-meta">
                    <span>{level.challengeType}</span>
                    <span>{level.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
            <details className="playbooks__mission-details">
              <summary>NPC Hints</summary>
              <ul>
                {game.levels.map((level) => (
                  <li key={`${level.id}-hint`}>
                    <strong>{level.title}</strong>
                    <ul>
                      {level.npcHints.map((hint) => (
                        <li key={hint}>{hint}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        );
      })}
    </div>
  );
}

export default MissionDeck;
