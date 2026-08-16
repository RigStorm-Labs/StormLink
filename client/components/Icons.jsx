const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icon = {
  Bolt: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2z" />
    </svg>
  ),
  Dashboard: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Folder: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7z" />
    </svg>
  ),
  Workflow: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H15a3 3 0 0 1 3 3v3.5" />
      <path d="M15.5 18H9a3 3 0 0 1-3-3v-3.5" />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M4 7.5 12 12l8-4.5" />
      <path d="M12 12v9" />
    </svg>
  ),
  Building: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="4" y="3.5" width="10" height="17" rx="1.5" />
      <path d="M14 9h4.5a1.5 1.5 0 0 1 1.5 1.5v10" />
      <path d="M2.5 20.5h19" />
      <path d="M7.5 7.5h3M7.5 11h3M7.5 14.5h3" />
    </svg>
  ),
  Shield: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8.1 7 9.8 4-1.7 7-5.4 7-9.8V5.8L12 3z" />
      <path d="m9.2 12 2 2 3.6-3.9" />
    </svg>
  ),
  Bell: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 3.6 1.2 5.1 2 6H4c.8-.9 2-2.4 2-6z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M14 4h-7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
      <path d="M10 12h10.5M17.5 8.5 21 12l-3.5 3.5" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4.5 6.5h15M9.5 6V4.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V6" />
      <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </svg>
  ),
  Edit: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20z" />
      <path d="m14.5 7 3 3" />
    </svg>
  ),
  X: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  ChevronRight: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  ),
  ChevronLeft: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  ),
  External: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v10A2.5 2.5 0 0 0 6.5 20h10a2.5 2.5 0 0 0 2.5-2.5V14" />
      <path d="M13.5 4.5H19.5V10.5" />
      <path d="M19 5 11 13" />
    </svg>
  ),
  Users: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3.1 2.8-5 5.5-5s4.9 1.9 5.5 5" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.4 14.9c1.7.8 2.8 2.4 3.2 4.6" />
    </svg>
  ),
  Target: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" />
    </svg>
  ),
  Menu: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </svg>
  ),
  Google: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" fill="#4285F4" />
      <path d="M12 21.5c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 21.5z" fill="#34A853" />
      <path d="M6.4 13.5a6 6 0 0 1 0-3.9V7H3.1a10 10 0 0 0 0 9l3.3-2.5z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5L18.7 4.5A10 10 0 0 0 3.1 7l3.3 2.6c.8-2.3 3-3.7 5.6-3.7z" fill="#EA4335" />
    </svg>
  ),
  Sparkle: (props) => (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
};
