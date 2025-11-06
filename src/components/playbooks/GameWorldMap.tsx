import BaseLink from "@/components/BaseLink";
import type { TrainingGame } from "@/content/industry/types";
import type { GameProgressSnapshot } from "./types";

interface GameWorldMapProps {
  games: TrainingGame[];
  progress: GameProgressSnapshot[];
}

function statusLabel(status: GameProgressSnapshot["status"]) {
  if (status === "completed") return "Selesai";
  if (status === "active") return "Aktif";
  return "Terkunci";
}

export function GameWorldMap({ games, progress }: GameWorldMapProps) {
  return (
    <section className="playbooks__map" data-animate>
      <div className="playbooks__map-grid">
        {games.map((game) => {
          const snapshot = progress.find((item) => item.playbookId === game.playbookId);
          const status = snapshot?.status ?? "locked";
          const totalXp = game.levels.reduce((sum, level) => sum + level.xp, 0);
          const earnedXp = snapshot?.xp ?? 0;

          return (
            <BaseLink
              key={game.playbookId}
              href={`/playbooks/${game.playbookId}/arena`}
              className={`card playbooks__map-card playbooks__map-card--${status}`}
            >
              <div className="playbooks__map-status">{statusLabel(status)}</div>
              <div className="k playbooks__map-title">{game.playbookId.replace(/-/g, " ")}</div>
              <p className="sub playbooks__map-story">{game.storyline}</p>
              <div className="playbooks__map-progress">
                <span>
                  XP {earnedXp}/{totalXp}
                </span>
                <span>{snapshot?.streak ? `Streak ${snapshot.streak}` : "Belum mulai"}</span>
              </div>
            </BaseLink>
          );
        })}
      </div>
    </section>
  );
}

export default GameWorldMap;
