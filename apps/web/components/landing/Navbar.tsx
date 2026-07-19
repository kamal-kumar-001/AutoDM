'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Zap, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LANDING_NAV } from '@/lib/landing-data';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        scrolled || mobileOpen
          ? 'bg-[#030712]/90 backdrop-blur-xl border-b border-white/5 shadow-lg'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,187,136,0.2)] group-hover:shadow-[0_0_20px_rgba(0,187,136,0.35)] transition-all">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight leading-none group-hover:text-primary transition-colors">
            {LANDING_NAV.logo}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {LANDING_NAV.links.map((link) => (
            <a
              key={link.label}
              href={isHomePage ? link.href : `/${link.href}`}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/about"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Panel - Smoothly Animated */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-white/5 bg-[#030712]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {LANDING_NAV.links.map((link) => (
                <a
                  key={link.label}
                  href={isHomePage ? link.href : `/${link.href}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Contact
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                {session ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white text-sm font-bold shadow-md"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 text-center rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-primary to-accent-cyan text-white text-sm font-bold shadow-md"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
