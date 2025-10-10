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
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { hourAngle, minuteAngle, secondAngle } = useMemo(() => getAngles(time), [time]);

  const ariaLabel = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="analog-clock" aria-label={ariaLabel} role="img">
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
