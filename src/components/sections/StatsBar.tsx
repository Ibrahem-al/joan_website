"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return { count, ref };
}

interface LiveStats { visitors: number; businesses: number; }

const STAT_CONFIG = [
  { key: "visitors",   label: "Site Visitors",    suffix: "+" },
  { key: "businesses", label: "Businesses Listed", suffix: "+" },
  { key: "states",     label: "States Active",     suffix: "", fixed: 50 },
];

function StatItem({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center px-8 py-8 group">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2 tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-medium text-forest-300 tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const [stats, setStats] = useState<LiveStats>({ visitors: 0, businesses: 0, states: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <section className="bg-forest-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/50 via-transparent to-forest-900/50 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 divide-x divide-forest-700">
          {STAT_CONFIG.map(({ key, label, suffix, fixed }) => (
            <StatItem
              key={key}
              label={label}
              value={fixed ?? stats[key as keyof LiveStats]}
              suffix={suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
