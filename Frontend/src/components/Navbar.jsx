import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, LogIn, LogOut, Shield, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import LoginModal from './LoginModal';

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Pelajar', href: '/#siswa' },
  { label: 'Proyek', href: '/projects' },
  { label: 'Prestasi', href: '/achievements' },
  { label: 'Sinematografi', href: '/cinematography' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, role, logout, showLogin, setShowLogin } = useAuth();
  const location = useLocation();

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-inverted tracking-tight">
                X<span className="text-primary"> PPLG 2</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.href ? 'text-primary bg-primary/5' : 'text-outlined hover:text-inverted hover:bg-black/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  {role === 'admin' && (
                    <Link to="/admin" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">Dashboard</span>
                    </Link>
                  )}
                  {role === 'student' && (
                    <Link to="/edit-profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary-dark transition-colors border border-black/5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold text-primary">{user?.name}</span>
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium text-outlined hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-outlined hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-black/5"
            >
              <div className="px-4 py-3 space-y-1 bg-white">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-outlined hover:text-inverted hover:bg-black/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <div className="pt-2 mt-2 border-t border-black/5 flex flex-col gap-2">
                    {role === 'admin' && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-xl">
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    {role === 'student' && (
                      <Link to="/edit-profile" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-xl">
                        👤 Edit Profil
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
