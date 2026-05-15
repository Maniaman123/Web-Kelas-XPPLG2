import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Code2, LogIn, LogOut, Shield, User, Home, Users, FolderGit2, Trophy, Camera } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../context/useAuth';
import LoginModal from './LoginModal';

const navLinks = [
  { label: 'Home',           href: '/',               icon: Home        },
  { label: 'Students',       href: '/students',      icon: Users       },
  { label: 'Projects',       href: '/projects',        icon: FolderGit2  },
  { label: 'Achievements',   href: '/achievements',    icon: Trophy      },
  { label: 'Cinematography', href: '/cinematography',  icon: Camera      },
];

export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const { isAuthenticated, user, role, logout, showLogin, setShowLogin } = useAuth();
  const location = useLocation();

  // Detect scroll for shadow intensification
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(href.replace('/#', '/'));

  return (
    <>
      {/* ── Floating wrapper — not full-width, centred ── */}
      <div
        className={`
          sticky top-3 z-50 px-3 sm:px-4
          transition-all duration-300
        `}
      >
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`
            max-w-7xl mx-auto
            rounded-2xl border
            backdrop-blur-md
            transition-all duration-300
            ${scrolled
              ? 'bg-white/80 border-black/8 shadow-[0_8px_32px_rgba(36,59,60,0.12)]'
              : 'bg-white/65 border-white/40 shadow-[0_4px_24px_rgba(36,59,60,0.08)]'
            }
          `}
        >
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">

              {/* ── Logo ── */}
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: '#243B3C' }}
                >
                  <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
                <div className="leading-tight">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight" style={{ color: '#101828' }}>
                    X<span style={{ color: '#243B3C' }}> PPLG 2</span>
                  </span>
                  <p className="hidden sm:block text-[9px] font-medium tracking-widest uppercase" style={{ color: '#667085' }}>
                    SMK Negeri 1 Ciomas
                  </p>
                </div>
              </Link>

              {/* ── Desktop Nav ── */}
              <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  const Icon   = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Link
                        to={link.href}
                        className={`
                          flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                          text-sm font-medium transition-colors duration-200
                          ${active
                            ? 'text-white shadow-sm'
                            : 'hover:bg-black/5'
                          }
                        `}
                        style={active
                          ? { background: '#243B3C', color: '#ffffff' }
                          : { color: '#101828' }
                        }
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* ── Right side: Auth + Hamburger ── */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    {/* Admin badge */}
                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:opacity-80"
                        style={{ background: '#DCEEFA', color: '#243B3C' }}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Dashboard
                      </Link>
                    )}

                    {/* Student profile pill */}
                    {role === 'student' && (
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                        <Link
                          to="/edit-profile"
                          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-black/5 transition-all hover:opacity-80"
                          style={{ background: '#DCEEFA', color: '#243B3C' }}
                        >
                          <User className="w-3.5 h-3.5" />
                          {user?.name?.split(' ')[0]}
                        </Link>
                      </motion.div>
                    )}

                    {/* Logout */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={logout}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:bg-red-50"
                      style={{ color: '#667085' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#667085'}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Keluar</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    onClick={() => setShowLogin(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: '#243B3C' }}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </motion.button>
                )}

                {/* Hamburger */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-xl transition-colors cursor-pointer"
                  style={{ color: '#101828' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileOpen
                      ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: 'block' }}><X    className="w-5 h-5" /></motion.span>
                      : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: 'block' }}><Menu className="w-5 h-5" /></motion.span>
                    }
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1 border-t space-y-1" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                  {navLinks.map((link, i) => {
                    const active = isActive(link.href);
                    const Icon   = link.icon;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: -12, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                      >
                        <Link
                          to={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                          style={active
                            ? { background: '#243B3C', color: '#fff' }
                            : { color: '#101828' }
                          }
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Auth actions in mobile */}
                  {isAuthenticated && (
                    <div className="pt-2 mt-1 space-y-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                      {role === 'admin' && (
                        <Link to="/admin" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: '#DCEEFA', color: '#243B3C' }}
                        >
                          <Shield className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      {role === 'student' && (
                        <Link to="/edit-profile" onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: '#DCEEFA', color: '#243B3C' }}
                        >
                          <User className="w-4 h-4" /> Edit Profil — {user?.name?.split(' ')[0]}
                        </Link>
                      )}
                      <button onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left cursor-pointer transition-colors hover:bg-red-50 hover:text-red-500"
                        style={{ color: '#667085' }}
                      >
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <button
                      onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white mt-1 cursor-pointer"
                      style={{ background: '#243B3C' }}
                    >
                      <LogIn className="w-4 h-4" /> Login
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
