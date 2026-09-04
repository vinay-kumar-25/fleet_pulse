import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { themes } from '../theme/themes';
import { Shield, Truck, ClipboardList, AlertTriangle, LogOut, Menu, X, Palette } from 'lucide-react';

export default function Navbar() {
  const { user, logout, activeTheme, currentThemeKey, setTheme, alertCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user.role === 'fleet_manager';

  const navLinks = isManager
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: Shield },
        { name: 'Vehicles', path: '/vehicles', icon: Truck },
        { name: 'Service Records', path: '/service-records', icon: ClipboardList },
        { name: 'Overdue Alerts', path: '/alerts', icon: AlertTriangle, badge: alertCount },
      ]
    : [{ name: 'My Assignments', path: '/my-assignments', icon: ClipboardList }];

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${activeTheme.border} ${activeTheme.sidebarBg} backdrop-blur-2xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${activeTheme.accent}`}>
              <Truck className="h-4.5 w-4.5" />
            </span>
            <span className={`font-bold text-lg tracking-wider ${activeTheme.textPrimary}`}>FLEET-PULSE</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive ? activeTheme.accent : `${activeTheme.textSecondary} hover:opacity-70`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                  {link.badge > 0 && (
                    <span className="ml-0.5 min-w-[18px] px-1.5 py-0.5 text-[10px] font-bold bg-red-500/15 text-red-500 rounded-full text-center leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Palette className={`w-4 h-4 ${activeTheme.textSecondary}`} />
              <select
                value={currentThemeKey}
                onChange={(e) => setTheme(e.target.value)}
                className={`mac-input text-xs py-1.5 pl-2 pr-6 cursor-pointer ${activeTheme.input}`}
              >
                {Object.keys(themes).map((key) => (
                  <option key={key} value={key}>
                    {themes[key].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right text-xs leading-tight">
              <div className={`font-semibold ${activeTheme.textPrimary}`}>{user.email}</div>
              <div className={`${activeTheme.textSecondary} capitalize`}>
                {user?.role?.replace('_', ' ') || 'User'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mac-icon-button hover:text-red-500"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mac-icon-button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t animate-[fadeIn_0.2s_ease] ${activeTheme.border} ${activeTheme.sidebarBg} backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1.5`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-base font-medium transition-all duration-200 active:scale-95 ${
                  isActive ? activeTheme.accent : activeTheme.textSecondary
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {link.name}
                </div>
                {link.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className={`pt-4 mt-2 border-t ${activeTheme.border} flex items-center justify-between`}>
            <select
              value={currentThemeKey}
              onChange={(e) => setTheme(e.target.value)}
              className={`mac-input text-sm py-1.5 px-2 ${activeTheme.input}`}
            >
              {Object.keys(themes).map((key) => (
                <option key={key} value={key}>
                  {themes[key].name}
                </option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              className="mac-button flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}