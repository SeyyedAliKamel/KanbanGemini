"use client";

import React from "react";
import { X, Palette, Sun, Moon, Check, Briefcase, Coffee, Terminal, Square } from "lucide-react";
import { Language, translations } from "@/data/translations";
import { ThemeConfig, ThemeVariant, ColorMode } from "@/types/theme";

interface ThemeModalProps {
  isOpen: boolean;
  themeConfig: ThemeConfig;
  language: Language;
  onUpdateTheme: (newConfig: ThemeConfig) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  themeConfig,
  language,
  onUpdateTheme,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = translations[language];

  const themesList: Array<{
    variant: ThemeVariant;
    title: string;
    desc: string;
    icon: React.ReactNode;
    swatches: string[];
  }> = [
    {
      variant: "cyberpunk",
      title: t.themeCyberpunk,
      desc: t.themeCyberpunkDesc,
      icon: <Terminal className="w-5 h-5 text-[#00f0ff]" />,
      swatches: ["#00f0ff", "#ff007f", "#0a0e1a", "#753991"],
    },
    {
      variant: "office",
      title: t.themeOffice,
      desc: t.themeOfficeDesc,
      icon: <Briefcase className="w-5 h-5 text-[#2563eb]" />,
      swatches: ["#2563eb", "#38bdf8", "#0f172a", "#f8fafc"],
    },
    {
      variant: "cozy",
      title: t.themeCozy,
      desc: t.themeCozyDesc,
      icon: <Coffee className="w-5 h-5 text-[#d97706]" />,
      swatches: ["#d97706", "#c2410c", "#faf6f0", "#1c1917"],
    },
    {
      variant: "brutal",
      title: t.themeBrutal,
      desc: t.themeBrutalDesc,
      icon: <Square className="w-5 h-5 text-[#facc15]" />,
      swatches: ["#facc15", "#000000", "#ffffff", "#ff007f"],
    },
  ];

  const handleModeChange = (mode: ColorMode) => {
    onUpdateTheme({ ...themeConfig, mode });
  };

  const handleVariantChange = (variant: ThemeVariant) => {
    onUpdateTheme({ ...themeConfig, variant });
  };

  const isRtl = language === "fa";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      data-testid="theme-settings-modal"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text-primary)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--theme-accent)] via-[var(--theme-accent-secondary)] to-[var(--theme-accent)]" />

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-accent)]">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--theme-text-primary)]">
                  {t.themeCustomizer}
                </h3>
                <p className="text-[11px] font-mono text-[var(--theme-text-muted)] mt-0.5">
                  {t.themeCustomizerSub}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-black/10 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label={t.close}
              data-testid="close-theme-settings-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {/* 1. Color Mode Switcher */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[var(--theme-text-secondary)] tracking-wider mb-2.5">
                {t.colorMode}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleModeChange("dark")}
                  className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    themeConfig.mode === "dark"
                      ? "bg-[var(--theme-accent)]/15 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-sm"
                      : "bg-[var(--theme-bg)] border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                  }`}
                  data-testid="theme-mode-dark-btn"
                >
                  <Moon className="w-4 h-4" />
                  <span>{t.darkMode}</span>
                  {themeConfig.mode === "dark" && <Check className="w-4 h-4 ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange("light")}
                  className={`flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    themeConfig.mode === "light"
                      ? "bg-[var(--theme-accent)]/15 border-[var(--theme-accent)] text-[var(--theme-accent)] shadow-sm"
                      : "bg-[var(--theme-bg)] border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                  }`}
                  data-testid="theme-mode-light-btn"
                >
                  <Sun className="w-4 h-4" />
                  <span>{t.lightMode}</span>
                  {themeConfig.mode === "light" && <Check className="w-4 h-4 ml-auto" />}
                </button>
              </div>
            </div>

            {/* 2. Theme Variant Cards */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-[var(--theme-text-secondary)] tracking-wider mb-2.5">
                {t.themeStyle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themesList.map((item) => {
                  const isSelected = themeConfig.variant === item.variant;
                  return (
                    <button
                      key={item.variant}
                      type="button"
                      onClick={() => handleVariantChange(item.variant)}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--theme-accent)]/15 border-[var(--theme-accent)] shadow-md ring-1 ring-[var(--theme-accent)]/40"
                          : "bg-[var(--theme-bg)] border-[var(--theme-border)] hover:border-[var(--theme-border-strong)]"
                      }`}
                      data-testid={`theme-variant-${item.variant}`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                            {item.icon}
                          </div>
                          <span className="font-bold text-sm font-mono text-[var(--theme-text-primary)]">
                            {item.title}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[var(--theme-accent)] text-[var(--theme-bg)] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--theme-text-secondary)] leading-relaxed mb-3 line-clamp-2">
                        {item.desc}
                      </p>

                      {/* Mini Swatches Preview */}
                      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-[var(--theme-border)]">
                        {item.swatches.map((swatch, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                        <span className="text-[10px] font-mono text-[var(--theme-text-muted)] ml-auto uppercase">
                          {item.variant}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[var(--theme-border)] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
              {t.activeTheme}{" "}
              <strong className="text-[var(--theme-accent)] uppercase">
                {themeConfig.variant} ({themeConfig.mode})
              </strong>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[var(--theme-accent)] text-[var(--theme-bg)] text-xs font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer"
              data-testid="theme-modal-apply-btn"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
