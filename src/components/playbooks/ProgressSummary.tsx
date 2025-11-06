import type { TrainingGame } from "@/content/industry/types";
import type { GameProgressSnapshot } from "./types";

interface ProgressSummaryProps {
  games: TrainingGame[];
  progress: GameProgressSnapshot[];
}

export function ProgressSummary({ games, progress }: ProgressSummaryProps) {
  const totalXp = games.reduce(
    (acc, game) => acc + game.levels.reduce((sum, level) => sum + level.xp, 0),
    0,
  );
  const earnedXp = progress.reduce((acc, item) => acc + item.xp, 0);
  const completedGames = progress.filter((item) => item.status === "completed").length;
  const activeGame = progress.find((item) => item.status === "active");

  return (
    <section className="playbooks__summary card" data-animate>
      <div className="playbooks__summary-grid">
        <div>
          <span className="playbooks__summary-label">Total XP</span>
          <div className="playbooks__summary-value">{totalXp}</div>
        </div>
        <div>
          <span className="playbooks__summary-label">XP Kamu</span>
          <div className="playbooks__summary-value">{earnedXp}</div>
        </div>
        <div>
          <span className="playbooks__summary-label">Playbook Tamat</span>
          <div className="playbooks__summary-value">
            {completedGames}/{games.length}
          </div>
        </div>
        <div>
          <span className="playbooks__summary-label">Lanjutkan</span>
          <div className="playbooks__summary-value">
            {activeGame ? activeGame.playbookId.replace(/-/g, " ") : "Pilih misi"}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProgressSummary;
