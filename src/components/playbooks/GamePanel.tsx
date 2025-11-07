import BaseLink from "@/components/BaseLink";
import type { TrainingGame } from "@/content/industry/types";
import type { GameProgressSnapshot } from "./types";

interface GamePanelProps {
  game: TrainingGame;
  progress?: GameProgressSnapshot;
}

const statusLabel: Record<GameProgressSnapshot["status"], string> = {
  locked: "Terkunci",
  active: "Aktif",
  completed: "Selesai",
};

export function GamePanel({ game, progress }: GamePanelProps) {
  const totalXp = game.levels.reduce((sum, level) => sum + level.xp, 0);
  const earnedXp = progress?.xp ?? 0;
  const streak = progress?.streak ?? 0;
  const status = progress?.status ?? "locked";
  const completedLevels = new Set(progress?.completedLevels ?? []);
  const lives = (progress?.state as { lives?: number })?.lives;

  return (
    <div className="card playbooks__game-panel" data-animate>
      <div className="playbooks__game-header">
        <div>
          <span className={`playbooks__game-status playbooks__game-status--${status}`}>
            {statusLabel[status]}
          </span>
          <div className="k">{game.playbookId.replace(/-/g, " ")}</div>
        </div>
        <div className="playbooks__game-metrics">
          <span>
            XP {earnedXp}/{totalXp}
          </span>
          <span>Streak {streak}</span>
          {typeof lives === "number" ? <span>Lives {lives}</span> : null}
        </div>
        <BaseLink className="pill" href={`/playbooks/${game.playbookId}/arena`}>
          Masuk Arena
        </BaseLink>
      </div>

      <div className="playbooks__game-body">
        <p className="sub">{game.storyline}</p>
        <div className="playbooks__game-boss">
          <strong>Boss Challenge</strong>
          <p className="sub">{game.bossChallenge}</p>
        </div>
        <div className="playbooks__game-rewards">
          <strong>Reward</strong>
          <div className="playbooks__game-reward-list">
            {game.rewards.map((reward) => (
              <div key={reward.id} className="playbooks__game-reward">
                <span>{reward.label}</span>
                <p className="sub">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="playbooks__game-levels">
        {game.levels.map((level) => (
          <div
            key={level.id}
            className={`playbooks__game-level${
              completedLevels.has(level.id) ? " playbooks__game-level--done" : ""
            }`}
          >
            <div>
              <strong>{level.title}</strong>
              <p className="sub">{level.summary}</p>
            </div>
            <div className="playbooks__game-level-meta">
              <span>{level.challengeType}</span>
              <span>{level.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GamePanel;
