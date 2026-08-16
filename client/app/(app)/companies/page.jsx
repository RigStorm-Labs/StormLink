'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { InlineLoader } from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import { Icon } from '@/components/Icons';
import { COMPANY_ACCENTS, companyUrl } from '@/lib/constants';

/** Canonical directory order from the RigStorm charter; new companies sort in after. */
const DIRECTORY_ORDER = [
  'RigStorm Labs',
  'RigStorm SiteMarket',
  'RigStorm LandAura',
  'RigStorm Zeyora',
  'AdStorm',
  'SkyED',
  'RigStorm Hub',
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    api('/companies')
      .then((d) =>
        setCompanies(
          [...(d.items || [])].sort((a, b) => {
            const ia = DIRECTORY_ORDER.indexOf(a.name);
            const ib = DIRECTORY_ORDER.indexOf(b.name);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
          })
        )
      )
      .catch(() => setCompanies([]));
  }, []);

  if (!companies) return <InlineLoader />;

  return (
    <div>
      <PageHeader
        title="Companies"
        subtitle="The RigStorm constellation — every venture, its mission and its goals, one click away."
      />

      {companies.length === 0 ? (
        <EmptyState title="No companies yet" message="Add companies from the Admin CMS to build the directory." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company, i) => {
            const accent = COMPANY_ACCENTS[company.accent] || COMPANY_ACCENTS.electric;
            return (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: 'easeOut' }}
                whileHover={{ y: -7 }}
                className="glass glass-hover group relative flex flex-col overflow-hidden p-6"
              >
                {/* Gradient glow on hover */}
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${accent.gradient} opacity-[0.12] blur-2xl transition-opacity duration-500 group-hover:opacity-25`}
                />

                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.gradient} font-display text-lg font-bold text-white shadow-lift`}
                  >
                    {company.name
                      .replace(/^RigStorm\s+/i, '')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold text-white">{company.name}</h3>
                    <p className="truncate text-xs text-slate-500">{company.url}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-300">{company.description}</p>

                {(company.goals || []).length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Key goals
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {company.goals.map((goal) => (
                        <span
                          key={goal}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-300"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 border-t border-white/[0.07] pt-4">
                  <a
                    href={companyUrl(company.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${accent.gradient} px-4 py-2 text-sm font-semibold text-white opacity-90 transition hover:opacity-100 hover:shadow-glow`}
                  >
                    Visit website
                    <Icon.External className="h-4 w-4" />
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Hub note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="glass mt-8 flex flex-col items-center gap-2 p-6 text-center"
      >
        <Icon.Bolt className="h-6 w-6 text-sky-300" />
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Every venture orbits the <span className="font-semibold text-white">RigStorm Hub</span> — the centralized
          innovation center connecting products, teams and goals across the whole storm.
        </p>
      </motion.div>
    </div>
  );
}
