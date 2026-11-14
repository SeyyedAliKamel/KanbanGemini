"use client";

import React from "react";
import {
  Terminal,
  Activity,
  Layers,
  Sliders,
  Languages,
  LogOut,
  UserCheck,
  Bot,
  Palette,
  Briefcase,
  Coffee,
  Square,
  CheckCircle2,
} from "lucide-react";
import { Language, translations } from "@/data/translations";
import { ThemeVariant } from "@/types/theme";

interface HeaderProps {
  totalCards: number;
  columnCount: number;
  language: Language;
  currentUser: string | null;
  themeVariant?: ThemeVariant;
  isAIChatOpen?: boolean;
  onToggleAIChat?: () => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  onOpenGridSettings: () => void;
  onOpenThemeSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCards,
  columnCount,
  language,
  currentUser,
  themeVariant = "cyberpunk",
  isAIChatOpen = false,
  onToggleAIChat,
  onToggleLanguage,
  onLogout,
  onOpenGridSettings,
  onOpenThemeSettings,
}) => {
  const t = translations[language];

  // Helper styles per theme
  const getHeaderClasses = () => {
    if (themeVariant === "office") {
      return "relative z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all";
    }
    if (themeVariant === "cozy") {
      return "relative z-30 border-b border-amber-200/70 dark:border-stone-800 bg-[#fdfbf7]/95 dark:bg-[#1f1b18]/95 backdrop-blur-md transition-all";
    }
    if (themeVariant === "brutal") {
      return "relative z-30 border-b-2 border-black dark:border-white bg-[#fffdf5] dark:bg-[#141414] shadow-[0px_4px_0px_#000] dark:shadow-[0px_4px_0px_#fff] transition-all";
    }
    return "relative z-30 border-b border-[#00f0ff]/20 bg-[#0a0e1a]/95 backdrop-blur-xl transition-all";
  };

  const getButtonClass = (variant: "normal" | "active" | "theme" | "danger" | "grid") => {
    if (themeVariant === "office") {
      if (variant === "active") {
        return "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-sans text-xs font-semibold shadow-xs transition-colors cursor-pointer";
      }
      if (variant === "danger") {
        return "flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-sans text-xs font-semibold shadow-xs transition-colors cursor-pointer";
      }
      return "flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-sans text-xs font-medium shadow-xs transition-colors cursor-pointer";
    }

    if (themeVariant === "cozy") {
      if (variant === "active") {
        return "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs font-semibold shadow-sm transition-all cursor-pointer";
      }
      if (variant === "danger") {
        return "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-200/80 dark:border-stone-700 bg-amber-50/50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-sans text-xs font-semibold transition-all cursor-pointer shadow-xs";
      }
      return "flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200/80 dark:border-stone-700 bg-[#fbf7f0] dark:bg-stone-800 text-amber-900 dark:text-amber-100 hover:bg-amber-100/60 dark:hover:bg-stone-700 font-sans text-xs font-medium transition-all cursor-pointer shadow-xs";
    }

    if (themeVariant === "brutal") {
      const baseBrutal =
        "rounded-none border-2 border-black dark:border-white font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer";
      if (variant === "active") {
        return `flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black ${baseBrutal}`;
      }
      if (variant === "danger") {
        return `flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white ${baseBrutal}`;
      }
      if (variant === "theme") {
        return `flex items-center gap-2 px-3 py-1.5 bg-yellow-300 dark:bg-yellow-400 text-black ${baseBrutal}`;
      }
      return `flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-black text-black dark:text-white ${baseBrutal}`;
    }

    // Default Cyberpunk
    if (variant === "active") {
      return "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#753991] bg-[#753991] text-white shadow-[0_0_15px_rgba(117,57,145,0.6)] font-mono text-xs font-semibold transition-all cursor-pointer";
    }
    if (variant === "theme") {
      return "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#ecad0a]/40 bg-[#121829] text-xs font-mono font-semibold text-[#ecad0a] hover:bg-[#ecad0a]/15 hover:shadow-[0_0_12px_rgba(236,173,10,0.3)] transition-all cursor-pointer";
    }
    if (variant === "danger") {
      return "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff007f]/40 bg-[#121829] text-xs font-mono font-semibold text-[#ff007f] hover:bg-[#ff007f]/15 hover:shadow-[0_0_12px_rgba(255,0,127,0.4)] transition-all cursor-pointer";
    }
    if (variant === "grid") {
      return "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00f0ff]/40 bg-[#121829] text-xs font-mono font-semibold text-[#00f0ff] hover:bg-[#00f0ff]/15 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer";
    }
    return "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#209dd7]/60 bg-[#121829] text-xs font-mono font-semibold text-[#209dd7] hover:bg-[#209dd7]/20 hover:shadow-[0_0_12px_rgba(32,157,215,0.4)] transition-all cursor-pointer";
  };

  const getUserBadgeClasses = () => {
    if (themeVariant === "office") {
      return "flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-sans text-xs text-slate-700 dark:text-slate-300";
    }
    if (themeVariant === "cozy") {
      return "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-300/60 dark:border-stone-700 bg-amber-100/50 dark:bg-stone-800 font-sans text-xs text-amber-900 dark:text-amber-200";
    }
    if (themeVariant === "brutal") {
      return "flex items-center gap-1.5 px-3 py-1.5 rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono font-black text-xs shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]";
    }
    return "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#753991]/50 bg-[#121829] font-mono text-xs text-[#f1f5f9]";
  };

  const getStatusBadgeClasses = () => {
    if (themeVariant === "office") {
      return "flex items-center gap-2.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs font-sans text-xs text-slate-700 dark:text-slate-200";
    }
    if (themeVariant === "cozy") {
      return "flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200/80 dark:border-stone-700 bg-amber-100/40 dark:bg-stone-800 font-sans text-xs text-amber-900 dark:text-amber-100";
    }
    if (themeVariant === "brutal") {
      return "flex items-center gap-2 px-3 py-1.5 rounded-none border-2 border-black dark:border-white bg-white dark:bg-[#1a1a1a] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] font-mono font-black text-xs text-black dark:text-white";
    }
    return "flex items-center gap-2.5 px-4 py-2 rounded-lg border border-[#00f0ff]/40 bg-[#121829] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-mono text-xs";
  };

  const renderBrand = () => {
    if (themeVariant === "office") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans flex items-center gap-2">
                <span>{t.officeTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-medium">
                  PRO
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t.officeStatus}</span>
              <span>•</span>
              <span data-testid="column-count-header">{columnCount} {t.officeLanes}</span>
            </div>
          </div>
        </div>
      );
    }

    if (themeVariant === "cozy") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-sm">
            <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-normal text-amber-950 dark:text-amber-100 flex items-center gap-2">
                <span>{t.cozyTitle}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 font-semibold border border-amber-300/60 dark:border-amber-700/60">
                  FLOW
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-800/70 dark:text-amber-300/70">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{t.cozyStatus}</span>
              <span>•</span>
              <span data-testid="column-count-header">{columnCount} {t.cozyLanes}</span>
            </div>
          </div>
        </div>
      );
    }

    if (themeVariant === "brutal") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-none border-2 border-black dark:border-white bg-yellow-400 text-black flex items-center justify-center shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
            <Square className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase text-black dark:text-yellow-400 flex items-center gap-2">
                <span>{t.brutalTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-black">
                  RAW
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-black dark:text-white mt-0.5">
              <span className="w-2 h-2 rounded-none bg-yellow-500 dark:bg-yellow-400" />
              <span>{t.brutalStatus}</span>
              <span>//</span>
              <span data-testid="column-count-header">{columnCount} {t.brutalLanes}</span>
            </div>
          </div>
        </div>
      );
    }

    // Default Cyberpunk
    return (
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#00f0ff] to-[#ff007f] opacity-40 blur-sm group-hover:opacity-80 transition duration-300" />
          <div className="relative w-11 h-11 rounded-lg border border-[#00f0ff]/50 bg-[#121829] flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Terminal className="w-6 h-6 stroke-[2.2]" />
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
    );
  };

  return (
    <header className={getHeaderClasses()}>
      {/* Top accent line only for non-office themes */}
      {themeVariant === "cyberpunk" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00f0ff] via-50% to-[#ff007f]" />
      )}
      {themeVariant === "cozy" && (
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-60" />
      )}
      {themeVariant === "brutal" && (
        <div className="h-1 w-full bg-black dark:bg-yellow-400 border-b border-black dark:border-white" />
      )}

      <div className="max-w-[1720px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        {renderBrand()}

        {/* Telemetry info HUD & Controls */}
        <div className="flex items-center gap-3">
          {/* User Badge if authenticated */}
          {currentUser && (
            <div className={getUserBadgeClasses()} data-testid="current-user-badge">
              <UserCheck className="w-3.5 h-3.5 text-current" />
              <span className="opacity-70">{t.userBadge}</span>
              <span className="font-bold">{currentUser}</span>
            </div>
          )}

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className={getButtonClass("normal")}
            data-testid="language-toggle-btn"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{t.languageToggle}</span>
          </button>

          {/* AI Copilot Toggle Button */}
          {currentUser && onToggleAIChat && (
            <button
              type="button"
              onClick={onToggleAIChat}
              className={getButtonClass(isAIChatOpen ? "active" : "normal")}
              data-testid="toggle-ai-chat-btn"
              title={t.aiToggleBtn}
              aria-label={t.aiToggleBtn}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">{t.aiToggleBtn}</span>
            </button>
          )}

          {/* Theme Settings Button / Tab */}
          {onOpenThemeSettings && (
            <button
              type="button"
              onClick={onOpenThemeSettings}
              className={getButtonClass("theme")}
              data-testid="open-theme-settings-btn"
              title={t.themeCustomizer}
              aria-label={t.themeTab}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t.themeTab}</span>
            </button>
          )}

          {/* Grid Settings Button */}
          <button
            type="button"
            onClick={onOpenGridSettings}
            className={getButtonClass("grid")}
            data-testid="open-grid-settings-btn"
            title="Calibrate visual grid settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.gridHud}</span>
          </button>

          {/* Grid Lanes Count Badge */}
          <div
            className={`hidden sm:flex items-center gap-2 ${
              themeVariant === "office"
                ? "px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-sans text-xs text-slate-600 dark:text-slate-300 shadow-xs"
                : themeVariant === "cozy"
                ? "px-3.5 py-1.5 rounded-full border border-amber-200/80 dark:border-stone-700 bg-amber-100/40 dark:bg-stone-800 font-sans text-xs text-amber-900 dark:text-amber-100"
                : themeVariant === "brutal"
                ? "px-3 py-1.5 rounded-none border-2 border-black dark:border-white bg-white dark:bg-[#121212] font-mono font-black text-xs shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-black dark:text-white"
                : "px-3 py-1.5 rounded border border-[#00f0ff]/20 bg-[#121829]/60 font-mono text-xs text-[#94a3b8]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-current opacity-80" />
            <span>GRID:</span>
            <span className="font-semibold text-current" data-testid="grid-lanes-count">
              {columnCount} {t.lanes}
            </span>
          </div>

          {/* Total Units Counter Badge */}
          <div className={getStatusBadgeClasses()}>
            <Activity className="w-4 h-4 text-current animate-pulse" />
            <span className="opacity-75">{t.activeUnits}</span>
            <span
              className="text-sm font-bold"
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
              className={getButtonClass("danger")}
              data-testid="logout-btn"
              title="Logout from session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
