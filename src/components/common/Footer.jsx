import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="font-display text-lg font-bold tracking-tight bg-linear-to-r from-violet-600 via-indigo-600 to-pink-600 dark:from-violet-400 dark:via-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
              AlumniConnect
            </span>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              &copy; {currentYear} AlumniConnect. All rights reserved.
            </p>
          </div>

          {/* Slogan */}
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for students & alumni globally.</span>
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
