export const ROLE_LABELS = { admin: 'Admin', member: 'Member', viewer: 'Viewer' };

export const PROJECT_STATUSES = ['planning', 'active', 'review', 'completed', 'on-hold'];
export const PRODUCT_STATUSES = ['concept', 'alpha', 'beta', 'active', 'retired'];
export const GOAL_STATUSES = ['on-track', 'at-risk', 'achieved'];
export const PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const TEAM_ROLES = ['Frontend', 'Backend', 'Design', 'QA', 'DevOps', 'AI', 'Product', 'Mobile'];

export const WORKFLOW_STAGES = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export const STATUS_STYLES = {
  planning: 'bg-slate-400/15 text-slate-300 border-slate-400/25',
  active: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  review: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  completed: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  'on-hold': 'bg-rose-400/15 text-rose-300 border-rose-400/25',
  concept: 'bg-slate-400/15 text-slate-300 border-slate-400/25',
  alpha: 'bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30',
  beta: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  retired: 'bg-rose-400/15 text-rose-300 border-rose-400/25',
  'on-track': 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  'at-risk': 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  achieved: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
  low: 'bg-slate-400/15 text-slate-300 border-slate-400/25',
  medium: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  high: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  critical: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
  announcement: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
  milestone: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  update: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  team: 'bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30',
};

export const COMPANY_ACCENTS = {
  electric: { gradient: 'from-sky-400 to-blue-600', glow: 'shadow-glow' },
  cyan: { gradient: 'from-cyan-400 to-sky-600', glow: 'shadow-glow' },
  emerald: { gradient: 'from-emerald-400 to-teal-600', glow: 'shadow-glow' },
  fuchsia: { gradient: 'from-fuchsia-400 to-violet-600', glow: 'shadow-glow-violet' },
  amber: { gradient: 'from-amber-400 to-orange-600', glow: 'shadow-glow' },
  sky: { gradient: 'from-sky-300 to-indigo-500', glow: 'shadow-glow' },
  violet: { gradient: 'from-violet-400 to-indigo-700', glow: 'shadow-glow-violet' },
};

export const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/workflows': 'Workflows',
  '/products': 'Products',
  '/companies': 'Companies',
  '/admin': 'Admin CMS',
};

export function companyUrl(url) {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
