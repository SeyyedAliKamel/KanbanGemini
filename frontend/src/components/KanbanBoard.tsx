"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, AlertTriangle, Palette } from "lucide-react";
import { INITIAL_COLUMNS } from "@/data/initialData";
import { Column, Card, GridSettings, ColumnsLayout } from "@/types/kanban";
import { ThemeConfig, DEFAULT_THEME_CONFIG } from "@/types/theme";
import { Language, translations } from "@/data/translations";
import { KanbanColumn } from "./KanbanColumn";
import { Header } from "./Header";
import { GridSettingsModal } from "./GridSettingsModal";
import { AuthModal } from "./AuthModal";
import { AIChatSidebar } from "./AIChatSidebar";
import { ThemeModal } from "./ThemeModal";
import {
  fetchBoard,
  apiCreateColumn,
  apiRenameColumn,
  apiDeleteColumn,
  apiCreateCard,
  apiUpdateCard,
  apiMoveCard,
  apiDeleteCard,
} from "@/lib/api";

const DEFAULT_GRID_SETTINGS: GridSettings = {
  visible: true,
  size: 48,
  opacity: 0.04,
  color: "cyan",
  columnsPerRow: "scroll",
};

interface KanbanBoardProps {
  initialUser?: string | null;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialUser }) => {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [gridSettings, setGridSettings] = useState<GridSettings>(DEFAULT_GRID_SETTINGS);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [currentUser, setCurrentUser] = useState<string | null>(initialUser ?? null);
  const [authChecked, setAuthChecked] = useState(initialUser !== undefined);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(DEFAULT_THEME_CONFIG);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Load theme from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kanban_theme_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.variant && parsed.mode) {
          setThemeConfig(parsed);
        }
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // Sync theme attributes to documentElement
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", themeConfig.variant);
      document.documentElement.setAttribute("data-mode", themeConfig.mode);
    }
  }, [themeConfig]);

  const handleUpdateTheme = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
    try {
      localStorage.setItem("kanban_theme_config", JSON.stringify(newConfig));
    } catch {
      // Ignore storage error
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fa" : "en"));
  };

  const t = translations[language];

  // Check authentication session on mount
  useEffect(() => {
    setIsMounted(true);
    if (initialUser !== undefined) {
      setAuthChecked(true);
      return;
    }
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user.username);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecked(true));
  }, [initialUser]);

  // Load board from API when authenticated
  useEffect(() => {
    if (currentUser) {
      fetchBoard()
        .then((cols) => {
          if (cols && cols.length > 0) {
            setColumns(cols);
          }
        })
        .catch(() => {
          // If offline or initial fallback
        });
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const isGridMode = gridSettings.columnsPerRow !== "scroll";

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const previousColumns = columns;
    const sourceColIndex = columns.findIndex((col) => col.id === source.droppableId);
    const destColIndex = columns.findIndex((col) => col.id === destination.droppableId);

    if (sourceColIndex === -1 || destColIndex === -1) return;

    const newColumns = [...columns];

    // Moving within the same column
    if (sourceColIndex === destColIndex) {
      const targetCol = { ...newColumns[sourceColIndex] };
      const newCards = Array.from(targetCol.cards);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);
      targetCol.cards = newCards;
      newColumns[sourceColIndex] = targetCol;
    } else {
      // Moving across different columns
      const sourceCol = { ...newColumns[sourceColIndex] };
      const destCol = { ...newColumns[destColIndex] };

      const sourceCards = Array.from(sourceCol.cards);
      const destCards = Array.from(destCol.cards);

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      sourceCol.cards = sourceCards;
      destCol.cards = destCards;

      newColumns[sourceColIndex] = sourceCol;
      newColumns[destColIndex] = destCol;
    }

    // Optimistic UI state update
    setColumns(newColumns);

    // Sync with backend API
    try {
      await apiMoveCard(draggableId, destination.droppableId, destination.index);
    } catch {
      // Revert optimistic update on failure
      setColumns(previousColumns);
      setApiError("Failed to synchronize card position with server.");
    }
  };

  const handleAddCard = async (columnId: string, title: string, details: string) => {
    const localId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const tempCard: Card = {
      id: localId,
      title,
      details,
    };
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, tempCard] } : col
      )
    );

    try {
      const created = await apiCreateCard(columnId, title, details);
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, cards: col.cards.map((c) => (c.id === localId ? created : c)) }
            : col
        )
      );
    } catch {
      // Keep optimistic card
    }
  };

  const handleEditCard = async (cardId: string, title: string, details: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === cardId ? { ...c, title, details } : c)),
      }))
    );
    try {
      await apiUpdateCard(cardId, title, details);
    } catch {
      setApiError("Failed to update card on server.");
    }
  };

  const handleDeleteCard = async (columnId: string, cardId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      )
    );
    try {
      await apiDeleteCard(cardId);
    } catch {
      // Ignore
    }
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col))
    );
    try {
      await apiRenameColumn(columnId, newTitle);
    } catch {
      // Ignore
    }
  };

  const handleAddColumn = async () => {
    const tempId = `col-${Date.now()}`;
    const title = `LANE ${columns.length + 1}`;
    const newCol: Column = {
      id: tempId,
      title,
      cards: [],
    };
    setColumns((prev) => [...prev, newCol]);

    try {
      const created = await apiCreateColumn(title);
      setColumns((prev) =>
        prev.map((c) => (c.id === tempId ? created : c))
      );
    } catch {
      // Keep optimistic
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    try {
      await apiDeleteColumn(columnId);
    } catch {
      // Ignore
    }
  };

  const handleLayoutChange = (layout: ColumnsLayout) => {
    setGridSettings((prev) => ({ ...prev, columnsPerRow: layout }));
  };

  // Dynamic visual grid styling per theme and mode
  const gridColorMap = {
    cyan: "0, 240, 255",
    magenta: "255, 0, 127",
    yellow: "252, 238, 10",
  };
  const rgb = gridColorMap[gridSettings.color];

  const getGridStyle = (): React.CSSProperties => {
    const isDark = themeConfig.mode === "dark";

    if (themeConfig.variant === "office") {
      const bg = isDark ? "#0f172a" : "#f8fafc";
      if (!gridSettings.visible) {
        return { backgroundColor: bg };
      }
      const lineColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";
      return {
        backgroundColor: bg,
        backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: `${gridSettings.size}px ${gridSettings.size}px`,
      };
    }

    if (themeConfig.variant === "cozy") {
      const bg = isDark ? "#1c1917" : "#faf6f0";
      const vignette = isDark
        ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.08), transparent)"
        : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(217, 119, 6, 0.05), transparent)";
      if (!gridSettings.visible) {
        return {
          backgroundColor: bg,
          backgroundImage: vignette,
          backgroundSize: "100% 100%",
        };
      }
      const warmLine = isDark ? "rgba(245, 158, 11, 0.04)" : "rgba(180, 83, 9, 0.035)";
      return {
        backgroundColor: bg,
        backgroundImage: `
          ${vignette},
          linear-gradient(to right, ${warmLine} 1px, transparent 1px),
          linear-gradient(to bottom, ${warmLine} 1px, transparent 1px)
        `,
        backgroundSize: `100% 100%, ${gridSettings.size}px ${gridSettings.size}px, ${gridSettings.size}px ${gridSettings.size}px`,
      };
    }

    if (themeConfig.variant === "brutal") {
      const bg = isDark ? "#0d0d0d" : "#fffdf5";
      const dotColor = isDark ? "rgba(255, 255, 255, 0.22)" : "rgba(0, 0, 0, 0.18)";
      if (!gridSettings.visible) {
        return { backgroundColor: bg };
      }
      return {
        backgroundColor: bg,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: `24px 24px`,
      };
    }

    // Default Cyberpunk
    const bg = isDark ? "#0a0e1a" : "#e5edf5";
    if (!gridSettings.visible) {
      return { backgroundColor: bg };
    }
    if (isDark) {
      return {
        backgroundColor: bg,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(${rgb}, 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 90% 80%, rgba(255, 0, 127, 0.08), transparent),
          radial-gradient(ellipse 50% 30% at 10% 90%, rgba(252, 238, 10, 0.05), transparent),
          linear-gradient(to right, rgba(${rgb}, ${gridSettings.opacity}) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(${rgb}, ${gridSettings.opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `100% 100%, 100% 100%, 100% 100%, ${gridSettings.size}px ${gridSettings.size}px, ${gridSettings.size}px ${gridSettings.size}px`,
      };
    }
    return {
      backgroundColor: bg,
      backgroundImage: `
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(2, 132, 199, 0.1), transparent),
        linear-gradient(to right, rgba(2, 132, 199, 0.08) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(2, 132, 199, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: `100% 100%, ${gridSettings.size}px ${gridSettings.size}px, ${gridSettings.size}px ${gridSettings.size}px`,
    };
  };

  const getBoardLayoutClass = () => {
    switch (gridSettings.columnsPerRow) {
      case "2":
        return "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";
      case "3":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full";
      case "4":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full";
      case "5":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full";
      case "fit":
        return "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full";
      case "scroll":
      default:
        return "flex items-start gap-6 pb-8 min-w-max justify-start";
    }
  };

  const getSubHeaderClass = () => {
    if (themeConfig.variant === "office") {
      return "border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-6 py-2.5 backdrop-blur-sm text-slate-600 dark:text-slate-300 font-sans";
    }
    if (themeConfig.variant === "cozy") {
      return "border-b border-amber-200/50 dark:border-stone-800 bg-[#f5eee4]/90 dark:bg-[#1a1715]/90 px-6 py-2.5 backdrop-blur-sm text-amber-900/80 dark:text-amber-200/80 font-sans";
    }
    if (themeConfig.variant === "brutal") {
      return "border-b-2 border-black dark:border-white bg-yellow-300 dark:bg-[#1a1a1a] px-6 py-2.5 text-black dark:text-yellow-400 font-mono font-black uppercase text-xs shadow-[0px_2px_0px_#000] dark:shadow-[0px_2px_0px_#fff]";
    }
    return "border-b border-[#00f0ff]/10 bg-[#0a0e1a]/70 px-6 py-2.5 backdrop-blur-sm font-mono text-[#94a3b8]";
  };

  const getSubHeaderPillClass = () => {
    if (themeConfig.variant === "office") {
      return "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-sans transition-all cursor-pointer shadow-xs";
    }
    if (themeConfig.variant === "cozy") {
      return "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-300/60 dark:border-stone-700 bg-amber-100/60 dark:bg-stone-800 text-amber-900 dark:text-amber-200 hover:bg-amber-200/60 dark:hover:bg-stone-700 text-xs font-sans transition-all cursor-pointer shadow-xs";
    }
    if (themeConfig.variant === "brutal") {
      return "hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-none border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 text-xs font-mono font-black uppercase shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] transition-all cursor-pointer";
    }
    return "hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#ecad0a]/30 bg-[#121829] hover:bg-[#ecad0a]/10 text-[#ecad0a] transition-all cursor-pointer text-[10px] font-mono";
  };

  const getRowSwitcherContainerClass = () => {
    if (themeConfig.variant === "office") {
      return "flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-sans text-xs";
    }
    if (themeConfig.variant === "cozy") {
      return "flex items-center gap-1.5 bg-amber-100/50 dark:bg-stone-800 px-2.5 py-1 rounded-full border border-amber-200/80 dark:border-stone-700 font-sans text-xs";
    }
    if (themeConfig.variant === "brutal") {
      return "flex items-center gap-1.5 bg-white dark:bg-[#121212] px-2 py-1 rounded-none border-2 border-black dark:border-white font-mono font-black shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] text-xs";
    }
    return "flex items-center gap-1.5 bg-[#121829] px-2 py-1 rounded border border-[#00f0ff]/20 font-mono text-[10px]";
  };

  const getRowSwitcherButtonClass = (layout: ColumnsLayout) => {
    const isActive = gridSettings.columnsPerRow === layout;
    if (themeConfig.variant === "office") {
      return `px-2 py-0.5 rounded text-xs font-sans font-medium transition-all cursor-pointer ${
        isActive
          ? "bg-blue-600 text-white shadow-xs"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`;
    }
    if (themeConfig.variant === "cozy") {
      return `px-2.5 py-0.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer ${
        isActive
          ? "bg-amber-600 text-white shadow-xs"
          : "text-amber-900/80 dark:text-amber-200/80 hover:bg-amber-200/60 dark:hover:bg-stone-700"
      }`;
    }
    if (themeConfig.variant === "brutal") {
      return `px-2 py-0.5 rounded-none text-xs font-mono font-black uppercase transition-all cursor-pointer ${
        isActive
          ? "bg-black text-white dark:bg-yellow-400 dark:text-black border border-black dark:border-white"
          : "text-black dark:text-white hover:bg-yellow-200 dark:hover:bg-stone-800"
      }`;
    }
    return `px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
      isActive
        ? "bg-[#00f0ff] text-[#0a0e1a]"
        : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#00f0ff]/10"
    }`;
  };

  if (!isMounted || !authChecked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0e1a] text-[#f1f5f9]" dir={language === "fa" ? "rtl" : "ltr"}>
        <Header
          totalCards={INITIAL_COLUMNS.reduce((a, c) => a + c.cards.length, 0)}
          columnCount={INITIAL_COLUMNS.length}
          language={language}
          currentUser={currentUser}
          onToggleLanguage={toggleLanguage}
          onLogout={handleLogout}
          onOpenGridSettings={() => {}}
        />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
            <div className="font-mono text-xs tracking-widest text-[#00f0ff] animate-pulse">
              [ INITIALIZING MATRIX INTERFACE ]
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col text-[#f1f5f9] transition-all duration-300 relative"
      style={getGridStyle()}
      dir={language === "fa" ? "rtl" : "ltr"}
      data-testid="kanban-app-container"
      data-theme={themeConfig.variant}
      data-mode={themeConfig.mode}
    >
      <Header
        totalCards={totalCards}
        columnCount={columns.length}
        language={language}
        currentUser={currentUser}
        themeVariant={themeConfig.variant}
        isAIChatOpen={isAIChatOpen}
        onToggleAIChat={() => setIsAIChatOpen((prev) => !prev)}
        onToggleLanguage={toggleLanguage}
        onLogout={handleLogout}
        onOpenGridSettings={() => setIsGridModalOpen(true)}
        onOpenThemeSettings={() => setIsThemeModalOpen(true)}
      />

      {/* Sync Error Notification Banner */}
      {apiError && (
        <div className="bg-[#ff007f]/20 border-b border-[#ff007f]/50 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-[#ff007f] z-40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>[SYNC ERROR] {apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="underline hover:text-white font-bold cursor-pointer ml-4"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Auth Modal Overlay when not authenticated */}
      <AuthModal
        isOpen={!currentUser}
        language={language}
        onSuccess={(username) => setCurrentUser(username)}
      />

      {/* Main Board View with blur when unauthenticated */}
      <div className={`flex-1 flex flex-col ${!currentUser ? "filter blur-[6px] pointer-events-none select-none" : ""}`}>
        {/* Sub-header status & layout toolbar */}
        <div className={getSubHeaderClass()}>
          <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold tracking-wider">
                {themeConfig.variant === "office"
                  ? "WORKSPACE ACTIVE"
                  : themeConfig.variant === "cozy"
                  ? "FOCUS MODE"
                  : themeConfig.variant === "brutal"
                  ? "[LIVE_BOARD]"
                  : "[ SYSTEM ACTIVE ]"}
              </span>
              <span className="hidden md:inline opacity-40">//</span>
              <span className="hidden md:inline">
                LANES: <span className="font-bold">{columns.length}</span>
              </span>
              <span className="hidden md:inline opacity-40">//</span>
              <span className="hidden md:inline" data-testid="grid-status-info">
                GRID: <span className="font-bold">{gridSettings.visible ? `${gridSettings.size}PX ${gridSettings.color.toUpperCase()}` : "INACTIVE"}</span>
              </span>

              {/* Theme Tab Pill */}
              <span className="hidden md:inline opacity-40">//</span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className={getSubHeaderPillClass()}
                data-testid="sub-theme-tab-btn"
                title={t.themeCustomizer}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>THEME: <strong>{themeConfig.variant.toUpperCase()}</strong> ({themeConfig.mode.toUpperCase()})</span>
              </button>

              {/* Quick Columns Per Row Switcher */}
              <div className={getRowSwitcherContainerClass()}>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="opacity-75">ROW:</span>
                {(["scroll", "2", "3", "4", "5", "fit"] as ColumnsLayout[]).map(
                  (layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => handleLayoutChange(layout)}
                      className={getRowSwitcherButtonClass(layout)}
                      data-testid={`layout-btn-${layout}`}
                    >
                      {layout.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="opacity-70 tracking-wider">
                {themeConfig.variant === "brutal"
                  ? "DRAG_N_DROP: ACTIVE"
                  : themeConfig.variant === "office"
                  ? "Real-time Workspace"
                  : "PROTOCOL: REALTIME_PANGEA_DND"}
              </span>
            </div>
          </div>
        </div>

        {/* Board Workspace */}
        <main
          className="flex-1 p-6 overflow-x-auto min-h-0"
          data-testid="kanban-main-workspace"
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="column">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${getBoardLayoutClass()} mx-auto max-w-[1720px]`}
                  data-testid="kanban-board"
                >
                  {columns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(columnProvided) => (
                        <div
                          ref={columnProvided.innerRef}
                          {...columnProvided.draggableProps}
                          className={isGridMode ? "w-full min-w-0" : ""}
                        >
                          <KanbanColumn
                            column={column}
                            columnIndex={index}
                            columnCount={columns.length}
                            onRenameColumn={handleRenameColumn}
                            onAddCard={handleAddCard}
                            onDeleteCard={handleDeleteCard}
                            onEditCard={handleEditCard}
                            onDeleteColumn={handleDeleteColumn}
                            columnDragHandleProps={columnProvided.dragHandleProps}
                            isGridMode={isGridMode}
                            themeVariant={themeConfig.variant}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add New Column Card Button */}
                  <div
                    className={`${
                      isGridMode ? "w-full min-w-0 min-h-32" : "w-80 min-w-80 flex-shrink-0"
                    } pt-0`}
                  >
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      className={`w-full h-full min-h-32 border-2 border-dashed flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group p-4 ${
                        themeConfig.variant === "office"
                          ? "rounded-lg border-slate-300 hover:border-blue-500 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 font-sans text-xs font-semibold hover:shadow-xs"
                          : themeConfig.variant === "cozy"
                          ? "rounded-3xl border-amber-300/80 hover:border-amber-500 bg-amber-50/20 dark:bg-stone-900/20 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:shadow-sm"
                          : themeConfig.variant === "brutal"
                          ? "rounded-none border-2 border-dashed border-black dark:border-white bg-yellow-400/20 hover:bg-yellow-400 text-black dark:text-white hover:text-black font-mono font-black text-xs uppercase shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]"
                          : "rounded-xl border-[#00f0ff]/30 hover:border-[#00f0ff] bg-[#121829]/40 hover:bg-[#00f0ff]/10 text-xs font-mono font-bold tracking-widest text-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                      }`}
                      data-testid="add-column-button"
                    >
                      <div className="w-8 h-8 rounded-full border border-current/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4 text-current" />
                      </div>
                      <span>+ ADD NEW LANE</span>
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>
      </div>

      {/* Grid Settings HUD Modal */}
      <GridSettingsModal
        isOpen={isGridModalOpen}
        settings={gridSettings}
        onUpdate={(newSettings) =>
          setGridSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onClose={() => setIsGridModalOpen(false)}
        onReset={() => setGridSettings(DEFAULT_GRID_SETTINGS)}
      />

      {/* Theme Customizer Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        themeConfig={themeConfig}
        language={language}
        onUpdateTheme={handleUpdateTheme}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* AI Copilot Sidebar */}
      <AIChatSidebar
        isOpen={isAIChatOpen && !!currentUser}
        onClose={() => setIsAIChatOpen(false)}
        language={language}
        onBoardUpdate={(newCols) => setColumns(newCols)}
      />
    </div>
  );
};
