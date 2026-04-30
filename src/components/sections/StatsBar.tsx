"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_STATS } from "@/lib/mockData";

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

const STATS = [
  { key: "visitors", label: "Site Visitors", value: SITE_STATS.visitors, suffix: "+" },
  { key: "businesses", label: "Businesses Listed", value: SITE_STATS.businesses, suffix: "+" },
  { key: "states", label: "States Active", value: SITE_STATS.states, suffix: "" },
  { key: "clients", label: "Clients Served", value: SITE_STATS.clients, suffix: "+" },
];

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const { count, ref } = useCountUp(stat.value);
  return (
    <div ref={ref} className="text-center px-8 py-8 group">
      <div className="text-4xl lg:text-5xl font-black text-white mb-2 tabular-nums">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-sm font-medium text-forest-300 tracking-wide uppercase">
        {stat.label}
      </div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="bg-forest-800 relative overflow-hidden">
      {/* Subtle gold accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-900/50 via-transparent to-forest-900/50 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-forest-700 divide-y lg:divide-y-0">
          {STATS.map((stat) => (
            <StatItem key={stat.key} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
