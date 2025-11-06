import type { TrainingGame } from "@/content/industry/types";
import type { GameProgressSnapshot } from "./types";

interface RewardsShelfProps {
  games: TrainingGame[];
  progress: GameProgressSnapshot[];
}

export function RewardsShelf({ games, progress }: RewardsShelfProps) {
  const claimedRewardIds = new Set(progress.flatMap((item) => item.claimedRewards));

  return (
    <div className="playbooks__rewards" data-animate>
      {games.map((game) => (
        <div key={game.playbookId} className="card playbooks__reward-card">
          <div className="playbooks__reward-header">
            <div className="k">{game.playbookId.replace(/-/g, " ")}</div>
            <p className="sub">{game.bossChallenge}</p>
          </div>
          <div className="playbooks__reward-list">
            {game.rewards.map((reward) => (
              <div
                key={reward.id}
                className={`playbooks__reward-item${
                  claimedRewardIds.has(reward.id) ? " playbooks__reward-item--claimed" : ""
                }`}
              >
                <strong>{reward.label}</strong>
                <p className="sub">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RewardsShelf;
