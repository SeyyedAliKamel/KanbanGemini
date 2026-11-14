"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, User, AlertCircle, KeyRound } from "lucide-react";
import { Language, translations } from "@/data/translations";

interface AuthModalProps {
  isOpen: boolean;
  language: Language;
  onSuccess: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  language,
  onSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(t.invalidCredentials);
      }

      const data = await response.json();
      onSuccess(data.user?.username || username);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.invalidCredentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-md"
      data-testid="auth-modal"
      dir={language === "fa" ? "rtl" : "ltr"}
    >
      <div className="relative w-full max-w-md p-8 rounded-xl border border-[#00f0ff]/40 bg-[#121829] shadow-[0_0_35px_rgba(0,240,255,0.25)] text-[#f1f5f9]">
        {/* Top glow border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00f0ff] via-[#753991] to-[#ecad0a] rounded-t-xl" />

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full border border-[#00f0ff]/60 bg-[#0a0e1a] flex items-center justify-center text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-mono font-bold tracking-wider text-[#00f0ff] uppercase" data-testid="auth-modal-title">
            {t.loginTitle}
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-5 p-3 rounded-lg border border-[#ff007f]/50 bg-[#ff007f]/10 text-[#ff007f] text-xs flex items-center gap-2"
            data-testid="auth-error-msg"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#94a3b8] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>{t.username}</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#00f0ff]/30 bg-[#0a0e1a] text-sm font-mono text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
              data-testid="username-input"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#94a3b8] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#ecad0a]" />
              <span>{t.password}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#00f0ff]/30 bg-[#0a0e1a] text-sm font-mono text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
              data-testid="password-input"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#209dd7] to-[#753991] hover:from-[#209dd7]/90 hover:to-[#753991]/90 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(32,157,215,0.4)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              data-testid="login-submit-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? t.loggingIn : t.loginBtn}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-[#00f0ff]/10 text-center text-[10px] font-mono text-[#94a3b8]/60">
          SECURE PROTOCOL // DEFAULT: user / password
        </div>
      </div>
    </div>
  );
};
