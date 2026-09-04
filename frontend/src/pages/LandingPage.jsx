import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Truck,
  ShieldCheck,
  History,
  FileSpreadsheet,
  BellRing,
  Moon,
  ArrowRight,
  LogIn,
  ExternalLink,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Strict Service Lifecycle Engine',
    desc: 'Server-side validation enforces a deterministic state machine: Due → Booked → In Service → Completed.',
  },
  {
    icon: History,
    title: 'Immutable Maintenance Audit Trail',
    desc: 'Completed service entries lock historical data — tamper-proof recordkeeping with one-click per-vehicle CSV exports.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Bulk Odometer Ingestion',
    desc: 'Fault-tolerant CSV parsing validates incoming mileage against current vehicle state, row by row.',
  },
  {
    icon: BellRing,
    title: 'Proactive Overdue Telemetry',
    desc: 'Configurable grace-period alert engine recalculates intervals and resurfaces dismissed warnings automatically.',
  },
];

const TECH_STACK = [
  { label: 'React 18 + Vite', group: 'Client' },
  { label: 'Tailwind CSS', group: 'Client' },
  { label: 'Node.js + Express', group: 'Server' },
  { label: 'MongoDB Atlas', group: 'Database' },
  { label: 'Vercel', group: 'Hosting' },
  { label: 'Render', group: 'Hosting' },
];

export default function LandingPage() {
  const { activeTheme } = useApp();

  return (
    <div className={`min-h-screen ${activeTheme.bg}`}>
      

      {/* ---------------- Hero ---------------- */}
      <section className={`relative overflow-hidden ${activeTheme.gradient}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center animate-[fadeIn_0.5s_ease]">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 ${activeTheme.badge}`}>
            <Moon className="w-3.5 h-3.5" /> Obsidian Dark UI System
          </span>

          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight ${activeTheme.textPrimary}`}>
            Fleet & service telemetry,
            <br />
            <span className={activeTheme.gradientText}>built for the field.</span>
          </h1>

          <p className={`mt-6 max-w-2xl mx-auto text-base sm:text-lg ${activeTheme.textSecondary}`}>
            Real-time vehicle telemetry, immutable service lifecycle tracking, and automated overdue
            alerts — with strict role-based access between fleet managers and field technicians.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className={`mac-button flex items-center gap-2 px-6 py-3 text-sm font-semibold ${activeTheme.button}`}
            >
              Sign In to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="https://fleet-pulse-dc2w.onrender.com/api"
              target="_blank"
              rel="noreferrer"
              className={`mac-button flex items-center gap-2 px-6 py-3 text-sm font-semibold ${activeTheme.buttonSecondary}`}
            >
              <ExternalLink className="w-4 h-4" /> API Docs
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- Feature grid ---------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${activeTheme.textPrimary}`}>
            Key capabilities
          </h2>
          <p className={`mt-2 text-sm ${activeTheme.textSecondary}`}>
            Everything a fleet operations team needs, none of the busywork.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className={`mac-card flex gap-4 p-6 transition-all duration-300 hover:-translate-y-0.5 ${activeTheme.card} ${activeTheme.cardHover}`}
            >
              <span className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 ${activeTheme.info}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className={`font-semibold ${activeTheme.textPrimary}`}>{title}</h3>
                <p className={`text-sm mt-1 leading-relaxed ${activeTheme.textSecondary}`}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Demo credentials ---------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className={`mac-card p-6 sm:p-8 ${activeTheme.card}`}>
          <h2 className={`text-lg font-bold ${activeTheme.textPrimary}`}>Try the live demo</h2>
          <p className={`text-sm mt-1 mb-6 ${activeTheme.textSecondary}`}>
            Two roles, two very different workflows — sign in with either to explore.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`rounded-2xl border p-4 ${activeTheme.border} ${activeTheme.input}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.textSecondary}`}>
                Fleet Manager
              </p>
              <p className={`mt-2 text-sm font-mono ${activeTheme.textPrimary}`}>manager@fleetpulse.com</p>
              <p className={`text-sm font-mono ${activeTheme.textMuted}`}>SecurePassword123</p>
              <p className={`mt-3 text-xs ${activeTheme.textSecondary}`}>
                Fleet creation, archiving, bulk odometer updates, technician assignments, global analytics.
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${activeTheme.border} ${activeTheme.input}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${activeTheme.textSecondary}`}>
                Technician
              </p>
              <p className={`mt-2 text-sm font-mono ${activeTheme.textPrimary}`}>tech@fleetpulse.com</p>
              <p className={`text-sm font-mono ${activeTheme.textMuted}`}>SecurePassword123</p>
              <p className={`mt-3 text-xs ${activeTheme.textSecondary}`}>
                Assigned task management, status progression, service updates.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className={`mac-button mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold ${activeTheme.accent}`}
          >
            Sign In Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- Tech stack strip ---------------- */}
      <section className={`border-t ${activeTheme.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className={`text-xs font-semibold uppercase tracking-wider text-center mb-5 ${activeTheme.textMuted}`}>
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((t) => (
              <span
                key={t.label}
                className={`text-xs font-medium px-3 py-1.5 rounded-full ${activeTheme.badge}`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className={`border-t ${activeTheme.border} py-6`}>
        <p className={`text-center text-xs ${activeTheme.textMuted}`}>
          © {new Date().getFullYear()} Fleet-Pulse — Fleet & Service Telemetry Platform
        </p>
      </footer>
    </div>
  );
}