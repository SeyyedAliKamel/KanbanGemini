"use client";

import React from "react";
import { Terminal, Activity, Layers, Sliders, Languages, LogOut, UserCheck } from "lucide-react";
import { Language, translations } from "@/data/translations";

interface HeaderProps {
  totalCards: number;
  columnCount: number;
  language: Language;
  currentUser: string | null;
  onToggleLanguage: () => void;
  onLogout: () => void;
  onOpenGridSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCards,
  columnCount,
  language,
  currentUser,
  onToggleLanguage,
  onLogout,
  onOpenGridSettings,
}) => {
  const t = translations[language];

  return (
    <header className="relative z-30 border-b border-[#00f0ff]/20 bg-[#0a0e1a]/90 backdrop-blur-xl">
      {/* Top micro neon bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00f0ff] via-50% to-[#ff007f]" />

      <div className="max-w-[1720px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#ff007f] opacity-40 blur-sm group-hover:opacity-80 transition duration-300" />
            <div className="relative w-11 h-11 rounded-lg border border-[#00f0ff]/60 bg-[#121829] flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Terminal className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-widest text-[#f1f5f9] uppercase flex items-center gap-2">
                <span>{t.cyberTitle}</span>
                <span className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
                  {t.matrixTitle}
                </span>
                <span className="text-xs px-2 py-0.5 rounded border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] font-mono tracking-normal font-semibold">
                  {t.kanbanBadge}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              <span className="text-[#00f0ff]">{t.nodeStatus}</span>
              <span className="tracking-wider">{t.synchronized}</span>
              <span className="text-[#94a3b8]/40">//</span>
              <span data-testid="column-count-header">{columnCount} {t.lanesConfigured}</span>
            </div>
          </div>
        </div>

        {/* Telemetry info HUD & Controls */}
        <div className="flex items-center gap-3">
          {/* User Badge if authenticated */}
          {currentUser && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#753991]/50 bg-[#121829] font-mono text-xs text-[#f1f5f9]"
              data-testid="current-user-badge"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#ecad0a]" />
              <span className="text-[#94a3b8]">{t.userBadge}</span>
              <span className="text-[#ecad0a] font-bold">{currentUser}</span>
            </div>
          )}

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#209dd7]/60 bg-[#121829] text-xs font-mono font-semibold text-[#209dd7] hover:bg-[#209dd7]/20 hover:shadow-[0_0_12px_rgba(32,157,215,0.4)] transition-all cursor-pointer"
            data-testid="language-toggle-btn"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-[#209dd7]" />
            <span>{t.languageToggle}</span>
          </button>

          {/* Grid Settings Button */}
          <button
            type="button"
            onClick={onOpenGridSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00f0ff]/40 bg-[#121829] text-xs font-mono font-semibold text-[#00f0ff] hover:bg-[#00f0ff]/15 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            data-testid="open-grid-settings-btn"
            title="Calibrate visual grid settings"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>{t.gridHud}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-[#00f0ff]/20 bg-[#121829]/60 font-mono text-xs text-[#94a3b8]">
            <Layers className="w-3.5 h-3.5 text-[#fcee0a]" />
            <span>GRID:</span>
            <span className="text-[#fcee0a] font-semibold" data-testid="grid-lanes-count">
              {columnCount} {t.lanes}
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-[#00f0ff]/40 bg-[#121829] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-mono text-xs">
            <Activity className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span className="text-[#94a3b8] tracking-wider">{t.activeUnits}</span>
            <span
              className="text-sm font-bold text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]"
              data-testid="total-cards-count"
            >
              {totalCards}
            </span>
          </div>

          {/* Logout Button if authenticated */}
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff007f]/40 bg-[#121829] text-xs font-mono font-semibold text-[#ff007f] hover:bg-[#ff007f]/15 hover:shadow-[0_0_12px_rgba(255,0,127,0.4)] transition-all cursor-pointer"
              data-testid="logout-btn"
              title="Logout from session"
            >
              <LogOut className="w-3.5 h-3.5 text-[#ff007f]" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
