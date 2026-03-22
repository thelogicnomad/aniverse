'use client';

import Link from 'next/link';
import { Zap, Github, Twitter, Heart } from 'lucide-react';

const footerLinks = {
  Browse: [
    { label: 'Home', href: '/' },
    { label: 'Top Anime', href: '/top-anime' },
    { label: 'Schedule', href: '/schedule' },
    { label: 'Movies', href: '/movies' },
    { label: 'TV Series', href: '/tv' },
    { label: 'OVA', href: '/ova' },
  ],
  Categories: [
    { label: 'Action', href: '/genre/action' },
    { label: 'Romance', href: '/genre/romance' },
    { label: 'Isekai', href: '/genre/isekai' },
    { label: 'Shounen', href: '/genre/shounen' },
    { label: 'Fantasy', href: '/genre/fantasy' },
    { label: 'Sci-Fi', href: '/genre/sci-fi' },
  ],
  Account: [
    { label: 'Watchlist', href: '/watchlist' },
    { label: 'History', href: '/history' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl text-gradient">AniVerse</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your ultimate destination for anime streaming. Watch thousands of anime in HD with sub & dub options.
            </p>
            <div className="flex gap-2">
              <a href="#" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} AniVerse. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for anime fans
          </p>
          <p className="text-xs text-gray-600 text-center">
            Disclaimer: AniVerse does not store any files. All content is provided by third-party services.
          </p>
        </div>
      </div>
    </footer>
  );
}
