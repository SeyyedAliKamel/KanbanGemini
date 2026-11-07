"use client";

import React from "react";
import { Terminal, Activity, Layers, Sliders } from "lucide-react";

interface HeaderProps {
  totalCards: number;
  columnCount: number;
  onOpenGridSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCards,
  columnCount,
  onOpenGridSettings,
}) => {
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
                <span>CYBER</span>
                <span className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
                  MATRIX
                </span>
                <span className="text-xs px-2 py-0.5 rounded border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] font-mono tracking-normal font-semibold">
                  KANBAN
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              <span className="text-[#00f0ff]">NODE_STATUS:</span>
              <span className="tracking-wider">SYNCHRONIZED</span>
              <span className="text-[#94a3b8]/40">//</span>
              <span data-testid="column-count-header">{columnCount} LANES CONFIGURED</span>
            </div>
          </div>
        </div>

        {/* Telemetry info HUD & Controls */}
        <div className="flex items-center gap-3">
          {/* Grid Settings Button */}
          <button
            type="button"
            onClick={onOpenGridSettings}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#00f0ff]/40 bg-[#121829] text-xs font-mono font-semibold text-[#00f0ff] hover:bg-[#00f0ff]/15 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            data-testid="open-grid-settings-btn"
            title="Calibrate visual grid settings"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>GRID HUD</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-[#00f0ff]/20 bg-[#121829]/60 font-mono text-xs text-[#94a3b8]">
            <Layers className="w-3.5 h-3.5 text-[#fcee0a]" />
            <span>GRID:</span>
            <span className="text-[#fcee0a] font-semibold" data-testid="grid-lanes-count">
              {columnCount} LANES
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-[#00f0ff]/40 bg-[#121829] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-mono text-xs">
            <Activity className="w-4 h-4 text-[#00f0ff] animate-pulse" />
            <span className="text-[#94a3b8] tracking-wider">ACTIVE UNITS:</span>
            <span
              className="text-sm font-bold text-[#00f0ff] drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]"
              data-testid="total-cards-count"
            >
              {totalCards}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
