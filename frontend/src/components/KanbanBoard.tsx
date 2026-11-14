"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, LayoutGrid, AlertTriangle } from "lucide-react";
import { INITIAL_COLUMNS } from "@/data/initialData";
import { Column, Card, GridSettings, ColumnsLayout } from "@/types/kanban";
import { Language, translations } from "@/data/translations";
import { KanbanColumn } from "./KanbanColumn";
import { Header } from "./Header";
import { GridSettingsModal } from "./GridSettingsModal";
import { AuthModal } from "./AuthModal";
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

  // Dynamic visual grid styling
  const gridColorMap = {
    cyan: "0, 240, 255",
    magenta: "255, 0, 127",
    yellow: "252, 238, 10",
  };
  const rgb = gridColorMap[gridSettings.color];

  const gridStyle: React.CSSProperties = gridSettings.visible
    ? {
        backgroundColor: "#0a0e1a",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(${rgb}, 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 90% 80%, rgba(255, 0, 127, 0.08), transparent),
          radial-gradient(ellipse 50% 30% at 10% 90%, rgba(252, 238, 10, 0.05), transparent),
          linear-gradient(to right, rgba(${rgb}, ${gridSettings.opacity}) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(${rgb}, ${gridSettings.opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `100% 100%, 100% 100%, 100% 100%, ${gridSettings.size}px ${gridSettings.size}px, ${gridSettings.size}px ${gridSettings.size}px`,
      }
    : {
        backgroundColor: "#0a0e1a",
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
      style={gridStyle}
      dir={language === "fa" ? "rtl" : "ltr"}
      data-testid="kanban-app-container"
    >
      <Header
        totalCards={totalCards}
        columnCount={columns.length}
        language={language}
        currentUser={currentUser}
        onToggleLanguage={toggleLanguage}
        onLogout={handleLogout}
        onOpenGridSettings={() => setIsGridModalOpen(true)}
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
        <div className="border-b border-[#00f0ff]/10 bg-[#0a0e1a]/70 px-6 py-2.5 backdrop-blur-sm">
          <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#94a3b8]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[#00f0ff]/80 font-semibold tracking-wider">
                [ SYSTEM ACTIVE ]
              </span>
              <span className="hidden md:inline text-[#94a3b8]/40">//</span>
              <span className="hidden md:inline">
                LANES: <span className="text-[#f1f5f9]">{columns.length}</span>
              </span>
              <span className="hidden md:inline text-[#94a3b8]/40">//</span>
              <span className="hidden md:inline" data-testid="grid-status-info">
                GRID: <span className="text-[#00f0ff]">{gridSettings.visible ? `${gridSettings.size}PX ${gridSettings.color.toUpperCase()}` : "INACTIVE"}</span>
              </span>

              {/* Quick Columns Per Row Switcher */}
              <div className="flex items-center gap-1.5 bg-[#121829] px-2 py-1 rounded border border-[#00f0ff]/20">
                <LayoutGrid className="w-3 h-3 text-[#00f0ff]" />
                <span className="text-[#94a3b8]">ROW:</span>
                {(["scroll", "2", "3", "4", "5", "fit"] as ColumnsLayout[]).map(
                  (layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => handleLayoutChange(layout)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                        gridSettings.columnsPerRow === layout
                          ? "bg-[#00f0ff] text-[#0a0e1a]"
                          : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#00f0ff]/10"
                      }`}
                      data-testid={`layout-btn-${layout}`}
                    >
                      {layout.toUpperCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#00f0ff]/60 tracking-wider">
                PROTOCOL: REALTIME_PANGEA_DND
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
                      className="w-full h-full min-h-32 rounded-xl border-2 border-dashed border-[#00f0ff]/30 hover:border-[#00f0ff] bg-[#121829]/40 hover:bg-[#00f0ff]/10 text-xs font-mono font-bold tracking-widest text-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group p-4"
                      data-testid="add-column-button"
                    >
                      <div className="w-8 h-8 rounded-full border border-[#00f0ff]/40 bg-[#0a0e1a] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4 text-[#00f0ff]" />
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
    </div>
  );
};
