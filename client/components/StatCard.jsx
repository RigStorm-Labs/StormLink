'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

/** Glass stat card with a GSAP-animated counter. */
export default function StatCard({ label, value, icon: CardIcon, hint, delay = 0 }) {
  const numberRef = useRef(null);

  useEffect(() => {
    const el = numberRef.current;
    if (!el || value === undefined || value === null) return;
    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: Number(value) || 0,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(counter.n);
      },
    });
    return () => tween.kill();
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className="glass glass-hover card-shine relative p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p ref={numberRef} className="mt-2 font-display text-4xl font-bold text-white text-glow">
            0
          </p>
          {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/25 to-violet-600/25 text-sky-300">
          <CardIcon className="h-6 w-6" />
        </span>
      </div>
    </motion.div>
  );
}
