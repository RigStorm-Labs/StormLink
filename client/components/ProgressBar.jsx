'use client';

import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, compact = false }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${compact ? 'h-1.5' : 'h-2'}`}>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
      />
    </div>
  );
}
