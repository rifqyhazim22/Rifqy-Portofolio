"use client";

import { useEffect, useMemo, useState } from "react";
import BaseLink from "@/components/BaseLink";
import type { TrainingGame, TrainingGameLevel } from "@/content/industry/types";
import type { MissionStatus } from "./types";

interface ProgressResponse {
  playbookId: string;
  status: MissionStatus;
  xp: number;
  streak: number;
  completedLevels: string[];
  claimedRewards: string[];
}

interface ArenaClientProps {
  game: TrainingGame;
}

type CoachAction = "hint" | "simulate" | "checklist";

export function ArenaClient({ game }: ArenaClientProps) {
  const [status, setStatus] = useState<MissionStatus>("active");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [activeLevelId, setActiveLevelId] = useState(() => game.levels[0]?.id ?? "");
  const [cooldowns, setCooldowns] = useState<Record<CoachAction, number>>({
    hint: 0,
    simulate: 0,
    checklist: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeLevel = useMemo<TrainingGameLevel | undefined>(
    () => game.levels.find((level) => level.id === activeLevelId),
    [game.levels, activeLevelId],
  );

  const totalXp = useMemo(
    () => game.levels.reduce((sum, level) => sum + level.xp, 0),
    [game.levels],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch(`/api/playbooks/${game.playbookId}/progress`, {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as ProgressResponse;
        if (cancelled) return;

        setStatus(payload.status);
        setXp(payload.xp);
        setStreak(payload.streak);
        setCompletedLevels(payload.completedLevels);
        setClaimedRewards(payload.claimedRewards);

        if (payload.completedLevels.length) {
          const lastLevel = payload.completedLevels[payload.completedLevels.length - 1];
          setActiveLevelId(lastLevel);
        }
      } catch (error) {
        console.error("Gagal memuat progres arena", error);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [game.playbookId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns((current) => {
        const next: Record<CoachAction, number> = { ...current };
        (Object.keys(next) as CoachAction[]).forEach((key) => {
          next[key] = Math.max(0, next[key] - 1);
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const persistProgress = async (next: ProgressResponse) => {
    try {
      const response = await fetch(`/api/playbooks/${game.playbookId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        setErrorMessage("Gagal menyimpan progres. Coba lagi.");
      } else {
        setErrorMessage(null);
      }
    } catch (error) {
      console.error("Gagal menyimpan progres arena", error);
      setErrorMessage("Koneksi terganggu. Progres tersimpan lokal.");
    }
  };

  const handleLevelComplete = (level: TrainingGameLevel) => {
    if (completedLevels.includes(level.id)) {
      return;
    }

    const nextCompleted = [...completedLevels, level.id];
    const nextXp = xp + level.xp;
    const nextStreak = streak + 1;
    const nextStatus: MissionStatus = nextCompleted.length === game.levels.length ? "completed" : "active";

    setCompletedLevels(nextCompleted);
    setXp(nextXp);
    setStreak(nextStreak);
    setStatus(nextStatus);

    const payload: ProgressResponse = {
      playbookId: game.playbookId,
      status: nextStatus,
      xp: nextXp,
      streak: nextStreak,
      completedLevels: nextCompleted,
      claimedRewards,
    };

    void persistProgress(payload);
  };

  const handleAction = (action: CoachAction) => {
    if (cooldowns[action] > 0) {
      return;
    }

    setCooldowns((current) => ({ ...current, [action]: 15 }));

    const query = new URLSearchParams({
      playbookId: game.playbookId,
      levelId: activeLevelId,
      action,
    });

    window.open(`/ai-agent?${query.toString()}`, "_blank");
  };

  const handleClaimRewards = async () => {
    if (status !== "completed") {
      return;
    }

    try {
      const response = await fetch(`/api/playbooks/${game.playbookId}/progress/claim-reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardIds: game.rewards.map((reward) => reward.id) }),
      });

      if (!response.ok) {
        setErrorMessage("Reward belum bisa diklaim. Cek syaratnya lagi.");
        return;
      }

      setClaimedRewards(game.rewards.map((reward) => reward.id));
      setErrorMessage(null);
    } catch (error) {
      console.error("Gagal klaim reward", error);
      setErrorMessage("Tidak bisa klaim reward sekarang.");
    }
  };

  return (
    <div className="playbooks-arena" data-animate>
      <header className="playbooks-arena__hero">
        <div>
          <h1 className="h1">{game.playbookId.replace(/-/g, " ")}</h1>
          <p className="sub">{game.storyline}</p>
        </div>
        <div className="playbooks-arena__stats">
          <div>
            <span>Status</span>
            <strong>{status === "completed" ? "Selesai" : "Aktif"}</strong>
          </div>
          <div>
            <span>XP</span>
            <strong>
              {xp}/{totalXp}
            </strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{streak}</strong>
          </div>
        </div>
      </header>

      <div className="playbooks-arena__grid">
        <section className="card playbooks-arena__panel">
          <h2 className="k">Brief Story</h2>
          <p className="sub">{game.storyline}</p>
          <div className="playbooks-arena__boss">
            <strong>Boss Challenge</strong>
            <p className="sub">{game.bossChallenge}</p>
          </div>
          <div className="playbooks-arena__rewards">
            <strong>Reward</strong>
            <ul>
              {game.rewards.map((reward) => (
                <li key={reward.id}>
                  {reward.label} — <span className="sub">{reward.description}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="pill playbooks-arena__claim"
              onClick={handleClaimRewards}
              disabled={status !== "completed"}
            >
              Klaim Reward
            </button>
          </div>
          <BaseLink href="/playbooks" className="pill playbooks-arena__back">
            ← Kembali ke Game Hub
          </BaseLink>
          {errorMessage ? <p className="playbooks-arena__error">{errorMessage}</p> : null}
        </section>

        <section className="card playbooks-arena__panel">
          <h2 className="k">Level & Progress</h2>
          <div className="playbooks-arena__levels">
            {game.levels.map((level) => {
              const isCompleted = completedLevels.includes(level.id);
              const isActive = activeLevelId === level.id;

              return (
                <button
                  key={level.id}
                  type="button"
                  className={`playbooks-arena__level${isCompleted ? " playbooks-arena__level--done" : ""}${
                    isActive ? " playbooks-arena__level--active" : ""
                  }`}
                  onClick={() => setActiveLevelId(level.id)}
                >
                  <span className="playbooks-arena__level-title">{level.title}</span>
                  <span className="playbooks-arena__level-meta">
                    {level.challengeType} · {level.xp} XP
                  </span>
                </button>
              );
            })}
          </div>

          {activeLevel ? (
            <div className="playbooks-arena__level-detail">
              <h3 className="k">{activeLevel.title}</h3>
              <p className="sub">{activeLevel.summary}</p>
              <strong>Objective</strong>
              <p className="sub">{activeLevel.objective}</p>
              <div className="playbooks-arena__hints">
                <strong>NPC Hints</strong>
                <ul>
                  {activeLevel.npcHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </div>
              <div className="playbooks-arena__resources">
                <strong>Resources</strong>
                <div className="playbooks-arena__resource-pills">
                  {activeLevel.resources.map((resource) => (
                    <BaseLink key={resource.href} className="pill" href={resource.href}>
                      {resource.title}
                    </BaseLink>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="pill hero__action hero__action--primary playbooks-arena__complete"
                onClick={() => handleLevelComplete(activeLevel)}
                disabled={completedLevels.includes(activeLevel.id)}
              >
                Tandai Selesai
              </button>
            </div>
          ) : null}
        </section>

        <section className="card playbooks-arena__panel">
          <h2 className="k">AI Coach</h2>
          <p className="sub">
            Gunakan agent untuk minta penjelasan, contoh, atau simulasi baru tanpa keluar dari arena.
          </p>
          <div className="playbooks-arena__coach-actions">
            <button
              type="button"
              className="pill"
              onClick={() => handleAction("hint")}
              disabled={cooldowns.hint > 0}
            >
              {cooldowns.hint > 0 ? `Hint (${cooldowns.hint}s)` : "Minta Hint"}
            </button>
            <button
              type="button"
              className="pill"
              onClick={() => handleAction("simulate")}
              disabled={cooldowns.simulate > 0}
            >
              {cooldowns.simulate > 0 ? `Simulasi (${cooldowns.simulate}s)` : "Simulasikan Kasus"}
            </button>
            <button
              type="button"
              className="pill"
              onClick={() => handleAction("checklist")}
              disabled={cooldowns.checklist > 0}
            >
              {cooldowns.checklist > 0 ? `Checklist (${cooldowns.checklist}s)` : "Buat Checklist"}
            </button>
          </div>
          <div className="playbooks-arena__coach-note">
            <strong>Sandbox Mode</strong>
            <p className="sub">
              Butuh eksperimen bebas? Arahkan agent untuk membuat skenario baru dan catat hasilnya sebelum
              mengklaim reward.
            </p>
          </div>
          <BaseLink className="pill" href="/ai-agent">
            Buka Halaman Agent →
          </BaseLink>
        </section>
      </div>
    </div>
  );
}

export default ArenaClient;
