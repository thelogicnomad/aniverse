'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, Tv, Film, ChevronDown, Shuffle,
  Bookmark, Bell, Zap, Clock, Star
} from 'lucide-react';
import { useSearchSuggestions } from '@/hooks/useAnime';
import { useWatchlistStore } from '@/store/watchlist';
import { GENRES } from '@/lib/constants';
import Image from 'next/image';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreOpen, setGenreOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: suggestions } = useSearchSuggestions(debouncedQuery);
  const watchlistCount = Object.keys(useWatchlistStore((s) => s.items)).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const handleRandom = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/api/v2/hianime/home');
      const data = await res.json();
      const pool = [
        ...(data?.data?.trendingAnimes || []),
        ...(data?.data?.mostPopularAnimes || []),
      ];
      if (pool.length > 0) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        router.push(`/anime/${random.id}`);
      }
    } catch { /* ignore */ }
  }, [router]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/tv', label: 'TV' },
    { href: '/movies', label: 'Movies' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-border/50' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gradient">AniVerse</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Genre Dropdown */}
            <div className="relative">
              <button
                onClick={() => setGenreOpen((p) => !p)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Genres <ChevronDown className={`w-3.5 h-3.5 transition-transform ${genreOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {genreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-64 glass rounded-xl p-3 grid grid-cols-2 gap-1 shadow-2xl"
                    onMouseLeave={() => setGenreOpen(false)}
                  >
                    {GENRES.slice(0, 24).map((g) => (
                      <Link
                        key={g}
                        href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                        className="text-xs text-gray-300 hover:text-white hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors truncate"
                        onClick={() => setGenreOpen(false)}
                      >
                        {g}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleRandom}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" /> Random
            </button>
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <div ref={searchRef} className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="flex items-center"
                >
                  <div className="flex items-center w-full bg-card border border-border rounded-xl overflow-hidden">
                    <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 outline-none"
                    />
                    <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Suggestions */}
                  <AnimatePresence>
                    {searchQuery.length > 1 && suggestions?.suggestions?.length ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden shadow-2xl z-50"
                      >
                        {suggestions.suggestions.slice(0, 7).map((s) => (
                          <Link
                            key={s.id}
                            href={`/anime/${s.id}`}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 transition-colors"
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          >
                            <div className="w-9 h-12 relative rounded-md overflow-hidden shrink-0 bg-card">
                              <Image src={s.poster} alt={s.name} fill className="object-cover" sizes="36px" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate">{s.name}</p>
                              <p className="text-xs text-gray-400 truncate">{s.moreInfo?.join(' · ')}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-white/10 border-t border-border transition-colors"
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        >
                          <Search className="w-3.5 h-3.5" /> See all results for &quot;{searchQuery}&quot;
                        </Link>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Watchlist */}
          <Link href="/watchlist" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:flex">
            <Bookmark className="w-5 h-5" />
            {watchlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center font-bold">
                {watchlistCount > 9 ? '9+' : watchlistCount}
              </span>
            )}
          </Link>

          {/* History */}
          <Link href="/history" className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:flex">
            <Clock className="w-5 h-5" />
          </Link>

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen((p) => !p)} className="md:hidden p-2 text-gray-300 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link href="/watchlist" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Bookmark className="w-4 h-4" /> Watchlist
              </Link>
              <Link href="/history" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Clock className="w-4 h-4" /> History
              </Link>
              <Link href="/schedule" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Star className="w-4 h-4" /> Schedule
              </Link>
              <button onClick={handleRandom} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors w-full">
                <Shuffle className="w-4 h-4" /> Random
              </button>
              <div className="pt-2 border-t border-border">
                <p className="px-3 text-xs text-gray-500 mb-2 uppercase tracking-wider">Genres</p>
                <div className="grid grid-cols-3 gap-1">
                  {GENRES.slice(0, 12).map((g) => (
                    <Link key={g} href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`} className="text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-white/10 transition-colors">
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
