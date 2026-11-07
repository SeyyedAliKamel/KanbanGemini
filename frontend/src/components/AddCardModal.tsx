"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, X, Terminal, AlertCircle } from "lucide-react";

interface AddCardModalProps {
  isOpen: boolean;
  columnTitle: string;
  onClose: () => void;
  onSubmit: (title: string, details: string) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  columnTitle,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDetails("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Card title is required");
      return;
    }
    onSubmit(title.trim(), details.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      data-testid="add-card-modal"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[#00f0ff]/50 bg-[#121829] shadow-[0_0_40px_rgba(0,240,255,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Strip */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#fcee0a]" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#00f0ff]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded border border-[#00f0ff]/40 bg-[#0a0e1a] flex items-center justify-center text-[#00f0ff]">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#f1f5f9] flex items-center gap-2">
                  <span>NEW PROTOCOL ENTRY</span>
                </h3>
                <p className="text-[11px] font-mono text-[#94a3b8] mt-0.5">
                  TARGET COLUMN:{" "}
                  <span className="text-[#00f0ff] font-semibold">{columnTitle}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-[#ff007f] hover:bg-[#ff007f]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close Modal"
              data-testid="close-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="card-title-input"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[#00f0ff]"
                >
                  // CARD TITLE *
                </label>
                <span className="text-[10px] font-mono text-[#94a3b8]/60">
                  REQUIRED
                </span>
              </div>
              <input
                id="card-title-input"
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g., Quantum Memory Allocation..."
                data-testid="new-card-title-input"
                className="w-full rounded-lg border border-[#00f0ff]/30 bg-[#0a0e1a] px-3.5 py-2.5 text-sm text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all"
              />
              {error && (
                <div
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-[#ff007f] font-mono"
                  data-testid="card-title-error"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="card-details-input"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[#94a3b8]"
                >
                  // SPECIFICATIONS & DETAILS
                </label>
                <span className="text-[10px] font-mono text-[#94a3b8]/60">
                  OPTIONAL
                </span>
              </div>
              <textarea
                id="card-details-input"
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter technical specifications, payload requirements, or notes..."
                data-testid="new-card-details-input"
                className="w-full rounded-lg border border-[#00f0ff]/30 bg-[#0a0e1a] px-3.5 py-2.5 text-sm text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#00f0ff]/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#94a3b8]/30 text-xs font-mono tracking-wider text-[#94a3b8] hover:text-[#f1f5f9] hover:border-[#94a3b8] transition-colors cursor-pointer"
                data-testid="cancel-add-card-btn"
              >
                [ ABORT ]
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#ff007f] text-xs font-mono font-bold tracking-wider text-white shadow-[0_0_15px_rgba(255,0,127,0.5)] hover:bg-[#e00070] hover:shadow-[0_0_20px_rgba(255,0,127,0.7)] transition-all cursor-pointer"
                data-testid="submit-add-card-btn"
              >
                [ SUBMIT CARD ]
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
