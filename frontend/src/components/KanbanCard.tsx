"use client";

import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, GripVertical, Edit2, Check, X } from "lucide-react";
import { Card } from "@/types/kanban";
import { ThemeVariant } from "@/types/theme";

interface KanbanCardProps {
  card: Card;
  index: number;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => void;
  onEdit?: (cardId: string, title: string, details: string) => void;
  accentColor?: string;
  themeVariant?: ThemeVariant;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  index,
  columnId,
  onDelete,
  onEdit,
  themeVariant = "cyberpunk",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDetails, setEditDetails] = useState(card.details);

  const handleSave = () => {
    if (editTitle.trim() && onEdit) {
      onEdit(card.id, editTitle.trim(), editDetails.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDetails(card.details);
    setIsEditing(false);
  };

  const getCardClasses = (isDragging: boolean) => {
    if (themeVariant === "office") {
      return isDragging
        ? "bg-white dark:bg-slate-800 border-blue-500 shadow-md z-50 rounded-lg scale-[1.01]"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs hover:shadow-sm rounded-lg hover:-translate-y-0.5";
    }
    if (themeVariant === "cozy") {
      return isDragging
        ? "bg-[#fffefc] dark:bg-stone-800 border-amber-400 shadow-lg z-50 rounded-2xl scale-[1.01]"
        : "bg-white dark:bg-stone-800 border-amber-200/70 dark:border-stone-700/80 shadow-sm hover:shadow-md rounded-2xl hover:-translate-y-0.5";
    }
    if (themeVariant === "brutal") {
      return isDragging
        ? "bg-yellow-300 border-2 border-black dark:border-white shadow-[6px_6px_0px_#000] dark:shadow-[6px_6px_0px_#fff] z-50 rounded-none rotate-1"
        : "bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] dark:hover:shadow-[4px_4px_0px_#fff] rounded-none";
    }
    // Default Cyberpunk
    return isDragging
      ? "bg-[#182138] border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.45)] z-50 scale-[1.02] rotate-1 rounded-lg"
      : "bg-[#0f1524]/95 border-[#00f0ff]/20 hover:border-[#00f0ff]/60 hover:shadow-[0_0_16px_rgba(0,240,255,0.18)] hover:-translate-y-0.5 rounded-lg";
  };

  const renderBadge = () => {
    if (themeVariant === "office") {
      return (
        <span className="font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Task {index + 1}
        </span>
      );
    }
    if (themeVariant === "cozy") {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
          #{index + 1}
        </span>
      );
    }
    if (themeVariant === "brutal") {
      return (
        <span className="font-mono text-[10px] font-black uppercase px-1.5 py-0.5 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
          [#{String(index + 1).padStart(2, "0")}]
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] tracking-wider text-[#00f0ff]/70 font-semibold">
        #CRD-{String(index + 1).padStart(2, "0")}
      </span>
    );
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid={`card-${card.id}`}
          className={`group relative mb-3 border transition-all duration-200 select-none overflow-hidden ${getCardClasses(
            snapshot.isDragging
          )}`}
        >
          {/* Subtle left theme indicator */}
          {themeVariant === "cyberpunk" && (
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#00f0ff] via-[#ff007f] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
          {themeVariant === "brutal" && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-yellow-400" />
          )}

          <div className="p-3.5 pl-4">
            {/* Top card metadata row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  {...provided.dragHandleProps}
                  className="text-current opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 rounded transition-opacity"
                  title="Drag Card"
                  data-testid={`drag-handle-${card.id}`}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                {renderBadge()}
              </div>

              <div className="flex items-center gap-1">
                {!isEditing && onEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#00f0ff]/15 p-1 rounded transition-all cursor-pointer"
                    title="Edit Card"
                    data-testid={`edit-card-${card.id}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(columnId, card.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#94a3b8] hover:text-[#ff007f] hover:bg-[#ff007f]/15 p-1 rounded transition-all cursor-pointer"
                  title="Delete Card"
                  aria-label={`Delete card ${card.title}`}
                  data-testid={`delete-card-${card.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#00f0ff]/40 bg-[#0a0e1a] text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-[#00f0ff]"
                  data-testid={`edit-title-input-${card.id}`}
                />
                <textarea
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 rounded border border-[#00f0ff]/40 bg-[#0a0e1a] text-xs font-mono text-[#f1f5f9] focus:outline-none focus:border-[#00f0ff] resize-none"
                  data-testid={`edit-details-input-${card.id}`}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-2 py-1 rounded bg-[#121829] text-[#94a3b8] hover:text-white text-xs font-mono"
                    data-testid={`cancel-edit-${card.id}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-2 py-1 rounded bg-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/30 text-xs font-mono"
                    data-testid={`save-edit-${card.id}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Card Title */}
                <h4
                  className="text-sm font-semibold text-[#f1f5f9] tracking-wide break-words group-hover:text-white transition-colors"
                  data-testid={`card-title-${card.id}`}
                >
                  {card.title}
                </h4>

                {/* Card Details */}
                {card.details && (
                  <p
                    className="text-xs text-[#94a3b8] mt-2 leading-relaxed break-words whitespace-pre-wrap font-sans border-t border-[#00f0ff]/10 pt-2"
                    data-testid={`card-details-${card.id}`}
                  >
                    {card.details}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
