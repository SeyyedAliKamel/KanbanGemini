import { Column, Card } from "@/types/kanban";
import { INITIAL_COLUMNS } from "@/data/initialData";

export interface ApiCard {
  id: string;
  column_id: string;
  title: string;
  details: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ApiColumn {
  id: string;
  board_id: string;
  title: string;
  position: number;
  cards: ApiCard[];
}

export interface ApiBoard {
  id: string;
  user_id: string;
  title: string;
  columns: ApiColumn[];
}

const OFFLINE_STORAGE_KEY = "kanban_board_state";

function getOfflineColumns(): Column[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return INITIAL_COLUMNS;
}

function saveOfflineColumns(columns: Column[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(columns));
    } catch {
      // ignore
    }
  }
}

export async function fetchBoard(): Promise<Column[]> {
  try {
    const res = await fetch("/api/board");
    if (!res.ok) {
      if (res.status === 404) {
        return getOfflineColumns();
      }
      throw new Error(`Failed to fetch board (${res.status})`);
    }
    const data: ApiBoard = await res.json();
    const cols = data.columns.map((col) => ({
      id: col.id,
      title: col.title,
      cards: col.cards.map((c) => ({
        id: c.id,
        title: c.title,
        details: c.details,
      })),
    }));
    saveOfflineColumns(cols);
    return cols;
  } catch (err) {
    return getOfflineColumns();
  }
}

export async function apiCreateColumn(title: string): Promise<Column> {
  try {
    const res = await fetch("/api/board/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      if (res.status === 404) {
        return { id: `col-${Date.now()}`, title, cards: [] };
      }
      throw new Error("Failed to create column");
    }
    const data: ApiColumn = await res.json();
    return {
      id: data.id,
      title: data.title,
      cards: [],
    };
  } catch {
    return { id: `col-${Date.now()}`, title, cards: [] };
  }
}

export async function apiRenameColumn(columnId: string, title: string): Promise<void> {
  try {
    const res = await fetch(`/api/board/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok && res.status !== 404) throw new Error("Failed to rename column");
  } catch {
    // Offline success
  }
}

export async function apiDeleteColumn(columnId: string): Promise<void> {
  try {
    const res = await fetch(`/api/board/columns/${columnId}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) throw new Error("Failed to delete column");
  } catch {
    // Offline success
  }
}

export async function apiCreateCard(columnId: string, title: string, details: string): Promise<Card> {
  try {
    const res = await fetch("/api/board/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: columnId, title, details }),
    });
    if (!res.ok) {
      if (res.status === 404) {
        return { id: `card-${Date.now()}`, title, details };
      }
      throw new Error("Failed to create card");
    }
    const data: ApiCard = await res.json();
    return {
      id: data.id,
      title: data.title,
      details: data.details,
    };
  } catch {
    return { id: `card-${Date.now()}`, title, details };
  }
}

export async function apiUpdateCard(cardId: string, title: string, details: string): Promise<void> {
  try {
    const res = await fetch(`/api/board/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, details }),
    });
    if (!res.ok && res.status !== 404) throw new Error("Failed to update card");
  } catch {
    // Offline success
  }
}

export async function apiMoveCard(cardId: string, targetColumnId: string, position: number): Promise<void> {
  try {
    const res = await fetch(`/api/board/cards/${cardId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_column_id: targetColumnId, position }),
    });
    if (!res.ok && res.status !== 404) throw new Error("Failed to move card");
  } catch {
    // Offline success
  }
}

export async function apiDeleteCard(cardId: string): Promise<void> {
  try {
    const res = await fetch(`/api/board/cards/${cardId}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) throw new Error("Failed to delete card");
  } catch {
    // Offline success
  }
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatResponse {
  response: string;
  actions_applied: number;
  board: ApiBoard;
}

export async function apiChatWithAI(
  message: string,
  history: ChatMessage[]
): Promise<{ response: string; actionsApplied: number; columns: Column[] }> {
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return {
          response: "Offline static mode. To interact with live OpenRouter AI, run with the Python FastAPI backend or configure on Vercel.",
          actionsApplied: 0,
          columns: [],
        };
      }
      let errorDetail = "AI request failed";
      try {
        const errJson = await res.json();
        if (errJson.detail) errorDetail = errJson.detail;
      } catch {
        // ignore
      }
      throw new Error(errorDetail);
    }

    const data: AIChatResponse = await res.json();
    const columns: Column[] = data.board.columns.map((col) => ({
      id: col.id,
      title: col.title,
      cards: col.cards.map((c) => ({
        id: c.id,
        title: c.title,
        details: c.details,
      })),
    }));

    return {
      response: data.response,
      actionsApplied: data.actions_applied,
      columns,
    };
  } catch (err: any) {
    if (err?.message && !err.message.includes("fetch")) {
      throw err;
    }
    return {
      response: "Offline static mode. To interact with live OpenRouter AI, run with the Python FastAPI backend or configure on Vercel.",
      actionsApplied: 0,
      columns: [],
    };
  }
}
