"use client";

import { useEffect, useMemo, useState } from "react";

function getAngles(date: Date) {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const hourAngle = hours * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return { hourAngle, minuteAngle, secondAngle };
}

export default function AnalogClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = window.setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { hourAngle, minuteAngle, secondAngle } = useMemo(() => {
    // Prevent hydration mismatch by using a fixed time (00:00:00) until mounted
    const current = time ?? new Date(new Date().setHours(0, 0, 0, 0));
    return getAngles(current);
  }, [time]);

  const ariaLabel =
    time?.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) ?? undefined;

  return (
    <div className="analog-clock" aria-label={ariaLabel} role="img" suppressHydrationWarning>
      <div className="analog-clock__dial">
        <div className="analog-clock__hand analog-clock__hand--hour" style={{ transform: `rotate(${hourAngle}deg)` }} />
        <div
          className="analog-clock__hand analog-clock__hand--minute"
          style={{ transform: `rotate(${minuteAngle}deg)` }}
        />
        <div
          className="analog-clock__hand analog-clock__hand--second"
          style={{ transform: `rotate(${secondAngle}deg)` }}
        />
        <div className="analog-clock__center" />
      </div>
    </div>
  );
}
