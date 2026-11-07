"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash2, GripVertical } from "lucide-react";
import { Card } from "@/types/kanban";

interface KanbanCardProps {
  card: Card;
  index: number;
  columnId: string;
  onDelete: (columnId: string, cardId: string) => void;
  accentColor?: string;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  index,
  columnId,
  onDelete,
}) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid={`card-${card.id}`}
          className={`group relative mb-3 rounded-lg border transition-all duration-200 select-none overflow-hidden ${
            snapshot.isDragging
              ? "bg-[#182138] border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.45)] z-50 scale-[1.02] rotate-1"
              : "bg-[#0f1524]/95 border-[#00f0ff]/20 hover:border-[#00f0ff]/60 hover:shadow-[0_0_16px_rgba(0,240,255,0.18)] hover:-translate-y-0.5"
          }`}
        >
          {/* Subtle left neon accent indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#00f0ff] via-[#ff007f] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="p-3.5 pl-4">
            {/* Top card metadata row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  {...provided.dragHandleProps}
                  className="text-[#94a3b8]/40 hover:text-[#00f0ff] cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-[#00f0ff]/10 transition-colors"
                  title="Drag Card"
                  data-testid={`drag-handle-${card.id}`}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[10px] tracking-wider text-[#00f0ff]/70 font-semibold">
                  #CRD-{String(index + 1).padStart(2, "0")}
                </span>
              </div>

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
          </div>
        </div>
      )}
    </Draggable>
  );
};
