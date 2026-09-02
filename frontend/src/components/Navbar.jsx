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
    <nav className={`border-b ${activeTheme.border} ${activeTheme.cardBg} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Truck className="h-7 w-7 text-emerald-500" />
            <span className={`font-bold text-lg tracking-wider ${activeTheme.textPrimary}`}>FLEET-PULSE </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? activeTheme.accent : `${activeTheme.textSecondary} hover:${activeTheme.textPrimary}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                  {link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs">
              <Palette className={`w-4 h-4 mr-1 ${activeTheme.textSecondary}`} />
              <select
                value={currentThemeKey}
                onChange={(e) => setTheme(e.target.value)}
                className={`text-xs p-1 rounded border ${activeTheme.inputBg} ${activeTheme.border}`}
              >
                {Object.keys(themes).map((key) => (
                  <option key={key} value={key}>
                    {themes[key].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right text-xs">
              <div className={`font-semibold ${activeTheme.textPrimary}`}>{user.email}</div>
<div className={`${activeTheme.textSecondary} capitalize`}>
  {user?.role?.replace('_', ' ') || 'User'}
</div>            </div>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-md border ${activeTheme.border} hover:bg-red-500/10 hover:text-red-500 transition-colors ${activeTheme.textSecondary}`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-md border ${activeTheme.border} ${activeTheme.textSecondary}`}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className={`md:hidden border-t ${activeTheme.border} ${activeTheme.cardBg} px-4 pt-2 pb-4 space-y-2`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path ? activeTheme.accent : activeTheme.textSecondary
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
          <div className={`pt-4 border-t ${activeTheme.border} flex items-center justify-between`}>
            <select
              value={currentThemeKey}
              onChange={(e) => setTheme(e.target.value)}
              className={`text-sm p-1.5 rounded border ${activeTheme.inputBg} ${activeTheme.border}`}
            >
              {Object.keys(themes).map((key) => (
                <option key={key} value={key}>
                  {themes[key].name}
                </option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 text-red-500`}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}