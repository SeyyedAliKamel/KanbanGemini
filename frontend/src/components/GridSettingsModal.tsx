"use client";

import React from "react";
import { X, Sliders, Eye, EyeOff, LayoutGrid } from "lucide-react";
import { GridSettings, ColumnsLayout } from "@/types/kanban";

interface GridSettingsModalProps {
  isOpen: boolean;
  settings: GridSettings;
  onUpdate: (newSettings: Partial<GridSettings>) => void;
  onClose: () => void;
  onReset: () => void;
}

export const GridSettingsModal: React.FC<GridSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdate,
  onClose,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      data-testid="grid-settings-modal"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#00f0ff]/50 bg-[#121829] shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Strip */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#fcee0a]" />

        <div className="p-6 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#00f0ff]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-[#00f0ff]/40 bg-[#0a0e1a] flex items-center justify-center text-[#00f0ff]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#f1f5f9]">
                  GRID CALIBRATION HUD
                </h3>
                <p className="text-[11px] font-mono text-[#94a3b8] mt-0.5">
                  VISUAL MATRIX & BOARD LAYOUT CONTROLS
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-[#ff007f] hover:bg-[#ff007f]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Settings"
              data-testid="close-grid-settings-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {/* Board Columns Per Row (To get rid of horizontal scroll) */}
            <div className="p-3.5 rounded-xl border border-[#00f0ff]/30 bg-[#0a0e1a]/80 shadow-[0_0_15px_rgba(0,240,255,0.08)]">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] font-bold flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>// COLUMNS PER ROW (NO SCROLL MODE)</span>
                </label>
                <span className="text-[10px] font-mono text-[#ff007f] font-semibold">
                  {settings.columnsPerRow === "scroll" ? "HORIZONTAL SCROLL" : "WRAPPED ROW GRID"}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { id: "scroll", label: "SCROLL" },
                  { id: "2", label: "2 / ROW" },
                  { id: "3", label: "3 / ROW" },
                  { id: "4", label: "4 / ROW" },
                  { id: "5", label: "5 / ROW" },
                  { id: "fit", label: "FIT ALL" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdate({ columnsPerRow: item.id as ColumnsLayout })}
                    className={`py-2 px-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                      settings.columnsPerRow === item.id
                        ? "border-[#00f0ff] bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                        : "border-[#00f0ff]/20 bg-[#121829] text-[#94a3b8] hover:border-[#00f0ff]/50 hover:text-white"
                    }`}
                    data-testid={`modal-layout-btn-${item.id}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-mono text-[#94a3b8]/70 mt-2">
                Select 2, 3, 4, 5, or FIT to arrange columns in multi-row grid and eliminate horizontal scrollbar.
              </p>
            </div>

            {/* Visibility Toggle */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-2">
                // BACKGROUND GRID SCANLINES
              </label>
              <button
                type="button"
                onClick={() => onUpdate({ visible: !settings.visible })}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer ${
                  settings.visible
                    ? "border-[#00f0ff] bg-[#00f0ff]/15 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                    : "border-[#94a3b8]/30 bg-[#0a0e1a] text-[#94a3b8]"
                }`}
                data-testid="toggle-grid-visibility-btn"
              >
                <span className="flex items-center gap-2">
                  {settings.visible ? (
                    <Eye className="w-4 h-4 text-[#00f0ff]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[#94a3b8]" />
                  )}
                  <span>MATRIX SCANLINES: {settings.visible ? "ACTIVE" : "OFF"}</span>
                </span>
                <span className="text-[10px] uppercase underline">TOGGLE</span>
              </button>
            </div>

            {/* Grid Density / Cell Size */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-2">
                // BACKGROUND CELL DENSITY / SIZE
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "24px DENSE", value: 24 },
                  { label: "48px NORMAL", value: 48 },
                  { label: "72px WIDE", value: 72 },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onUpdate({ size: item.value })}
                    className={`py-2 px-2 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                      settings.size === item.value
                        ? "border-[#00f0ff] bg-[#00f0ff]/20 text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.25)]"
                        : "border-[#00f0ff]/20 bg-[#0a0e1a] text-[#94a3b8] hover:border-[#00f0ff]/40"
                    }`}
                    data-testid={`grid-size-btn-${item.value}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Neon Color */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-2">
                // NEON EMISSION TINT
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "cyan", label: "CYAN", color: "#00f0ff", border: "border-[#00f0ff]" },
                  { key: "magenta", label: "MAGENTA", color: "#ff007f", border: "border-[#ff007f]" },
                  { key: "yellow", label: "YELLOW", color: "#fcee0a", border: "border-[#fcee0a]" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onUpdate({ color: item.key as GridSettings["color"] })}
                    className={`py-2 px-2 rounded-lg border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.color === item.key
                        ? `${item.border} bg-[#182138] text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]`
                        : "border-white/10 bg-[#0a0e1a] text-[#94a3b8] hover:border-white/20"
                    }`}
                    data-testid={`grid-color-btn-${item.key}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glow Intensity */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8] mb-2">
                // GLOW INTENSITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "LOW", value: 0.02 },
                  { label: "MEDIUM", value: 0.04 },
                  { label: "HIGH", value: 0.08 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onUpdate({ opacity: item.value })}
                    className={`py-2 px-2 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                      settings.opacity === item.value
                        ? "border-[#ff007f] bg-[#ff007f]/20 text-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.25)]"
                        : "border-[#00f0ff]/20 bg-[#0a0e1a] text-[#94a3b8] hover:border-[#00f0ff]/40"
                    }`}
                    data-testid={`grid-opacity-btn-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#00f0ff]/10">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded border border-[#94a3b8]/30 text-xs font-mono text-[#94a3b8] hover:text-[#f1f5f9] transition-colors cursor-pointer"
              data-testid="reset-grid-settings-btn"
            >
              [ RESET ]
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#00f0ff] text-xs font-mono font-bold tracking-wider text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#33f3ff] transition-all cursor-pointer"
              data-testid="confirm-grid-settings-btn"
            >
              [ APPLY ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
