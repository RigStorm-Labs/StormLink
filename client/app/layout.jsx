import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'StormLink — RigStorm Command Center',
  description:
    'Centralized StormLink dashboard for RigStorm companies — project tracking, workflow organization, and company-wide communication.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Typography: Poppins (display) + Inter (body) with graceful fallbacks */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Ambient aurora background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="aurora-blob left-[-8%] top-[-12%] h-[46rem] w-[46rem] bg-sky-500/25 animate-aurora" />
          <div className="aurora-blob right-[-10%] top-[12%] h-[40rem] w-[40rem] bg-violet-600/25 animate-aurora-slow" />
          <div className="aurora-blob bottom-[-18%] left-[30%] h-[42rem] w-[42rem] bg-indigo-700/20 animate-aurora" />
        </div>

        <Providers>
          <div className="relative z-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
