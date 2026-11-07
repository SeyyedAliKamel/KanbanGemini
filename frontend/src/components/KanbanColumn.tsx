"use client";

import React, { useState, useRef, useEffect } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, Edit2, Check, X, Trash2, GripHorizontal } from "lucide-react";
import { Column } from "@/types/kanban";
import { KanbanCard } from "./KanbanCard";
import { AddCardModal } from "./AddCardModal";

interface KanbanColumnProps {
  column: Column;
  columnIndex: number;
  columnCount: number;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  columnDragHandleProps?: any;
  isGridMode?: boolean;
}

const COLUMN_THEMES = [
  {
    accent: "#00f0ff",
    border: "border-[#00f0ff]/30",
    topGradient: "from-[#00f0ff] to-transparent",
    badge: "border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff]",
    dot: "bg-[#00f0ff]",
  },
  {
    accent: "#a855f7",
    border: "border-[#a855f7]/30",
    topGradient: "from-[#a855f7] to-transparent",
    badge: "border-[#a855f7]/40 bg-[#a855f7]/10 text-[#a855f7]",
    dot: "bg-[#a855f7]",
  },
  {
    accent: "#ff007f",
    border: "border-[#ff007f]/30",
    topGradient: "from-[#ff007f] to-transparent",
    badge: "border-[#ff007f]/40 bg-[#ff007f]/10 text-[#ff007f]",
    dot: "bg-[#ff007f]",
  },
  {
    accent: "#fcee0a",
    border: "border-[#fcee0a]/30",
    topGradient: "from-[#fcee0a] to-transparent",
    badge: "border-[#fcee0a]/40 bg-[#fcee0a]/10 text-[#fcee0a]",
    dot: "bg-[#fcee0a]",
  },
  {
    accent: "#00f0ff",
    border: "border-[#00f0ff]/30",
    topGradient: "from-[#00f0ff] via-[#ff007f] to-transparent",
    badge: "border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff]",
    dot: "bg-[#00f0ff]",
  },
];

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnIndex,
  columnCount,
  onRenameColumn,
  onAddCard,
  onDeleteCard,
  onDeleteColumn,
  columnDragHandleProps,
  isGridMode = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const theme = COLUMN_THEMES[columnIndex % COLUMN_THEMES.length];

  useEffect(() => {
    setTitleInput(column.title);
  }, [column.title]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    } else {
      setTitleInput(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(column.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelTitle();
    }
  };

  return (
    <>
      <div
        className={`flex flex-col ${
          isGridMode ? "w-full min-w-0 max-w-none" : "w-80 min-w-80 max-w-80"
        } rounded-xl border ${theme.border} bg-[#121829]/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex-shrink-0 max-h-[calc(100vh-160px)] transition-all duration-200 overflow-hidden relative group`}
        data-testid={`column-${column.id}`}
      >
        {/* Top glowing neon accent line */}
        <div
          className={`h-[3px] w-full bg-gradient-to-r ${theme.topGradient}`}
        />

        {/* Column Header */}
        <div className="p-4 border-b border-[#00f0ff]/15 bg-[#0a0e1a]/60 flex items-center justify-between gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleSaveTitle}
                className="w-full text-sm font-bold tracking-wide text-[#f1f5f9] bg-[#0a0e1a] border border-[#00f0ff] rounded px-2.5 py-1 outline-none focus:ring-1 focus:ring-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)] font-sans"
                data-testid={`column-title-input-${column.id}`}
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSaveTitle();
                }}
                className="p-1 text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded cursor-pointer transition-colors"
                title="Save Title"
                data-testid={`save-column-title-${column.id}`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelTitle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCancelTitle();
                }}
                className="p-1 text-[#94a3b8] hover:text-[#ff007f] hover:bg-[#ff007f]/10 rounded cursor-pointer transition-colors"
                title="Cancel"
                data-testid={`cancel-column-title-${column.id}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {columnDragHandleProps && (
                <div
                  {...columnDragHandleProps}
                  className="text-[#94a3b8]/40 hover:text-[#00f0ff] cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                  title="Drag Column"
                  data-testid={`column-drag-handle-${column.id}`}
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                <span className="text-[10px] font-mono text-[#94a3b8] font-bold tracking-wider">
                  0{columnIndex + 1}
                </span>
              </div>
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold tracking-wide text-[#f1f5f9] truncate cursor-pointer hover:text-[#00f0ff] transition-colors uppercase"
                title="Click to rename column"
                data-testid={`column-title-${column.id}`}
              >
                {column.title}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#94a3b8] hover:text-[#00f0ff] transition-opacity cursor-pointer"
                title="Rename Column"
                aria-label={`Rename column ${column.title}`}
                data-testid={`edit-column-title-${column.id}`}
              >
                <Edit2 className="w-3 h-3" />
              </button>

              {columnCount > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteColumn(column.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#94a3b8] hover:text-[#ff007f] hover:bg-[#ff007f]/15 rounded transition-all cursor-pointer ml-auto"
                  title="Delete Column"
                  aria-label={`Delete column ${column.title}`}
                  data-testid={`delete-column-${column.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div
            className={`px-2 py-0.5 rounded border ${theme.badge} text-[11px] font-mono font-bold tracking-wider shadow-sm ml-1`}
            data-testid={`column-card-count-${column.id}`}
          >
            {column.cards.length}
          </div>
        </div>

        {/* Droppable Card Zone */}
        <Droppable droppableId={column.id} type="card">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              data-testid={`droppable-${column.id}`}
              className={`flex-1 overflow-y-auto p-3 transition-colors duration-150 min-h-36 ${
                snapshot.isDraggingOver
                  ? "bg-[#00f0ff]/10 ring-1 ring-inset ring-[#00f0ff]/50 shadow-[inset_0_0_20px_rgba(0,240,255,0.15)]"
                  : "bg-transparent"
              }`}
            >
              {column.cards.map((card, idx) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={idx}
                  columnId={column.id}
                  onDelete={onDeleteCard}
                />
              ))}
              {provided.placeholder}

              {column.cards.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#00f0ff]/15 rounded-lg bg-[#0a0e1a]/30">
                  <p className="font-mono text-[11px] tracking-widest text-[#94a3b8]/50">
                    [ SECURE SLOT EMPTY ]
                  </p>
                  <span className="font-mono text-[10px] text-[#94a3b8]/30 mt-1">
                    DROP UNITS OR ADD NEW
                  </span>
                </div>
              )}
            </div>
          )}
        </Droppable>

        {/* Add Card Action Button */}
        <div className="p-3 border-t border-[#00f0ff]/15 bg-[#0a0e1a]/60">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#ff007f]/40 bg-[#ff007f]/10 text-xs font-mono font-bold tracking-wider text-[#ff007f] hover:bg-[#ff007f] hover:text-white hover:shadow-[0_0_16px_rgba(255,0,127,0.5)] transition-all duration-200 cursor-pointer active:scale-[0.99]"
            data-testid={`add-card-button-${column.id}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ADD CARD</span>
          </button>
        </div>
      </div>

      <AddCardModal
        isOpen={isAddModalOpen}
        columnTitle={column.title}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(title, details) => onAddCard(column.id, title, details)}
      />
    </>
  );
};
