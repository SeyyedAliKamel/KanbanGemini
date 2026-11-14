import { Column, Card } from "@/types/kanban";

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

export async function fetchBoard(): Promise<Column[]> {
  const res = await fetch("/api/board");
  if (!res.ok) {
    throw new Error(`Failed to fetch board (${res.status})`);
  }
  const data: ApiBoard = await res.json();
  
  return data.columns.map((col) => ({
    id: col.id,
    title: col.title,
    cards: col.cards.map((c) => ({
      id: c.id,
      title: c.title,
      details: c.details,
    })),
  }));
}

export async function apiCreateColumn(title: string): Promise<Column> {
  const res = await fetch("/api/board/columns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create column");
  const data: ApiColumn = await res.json();
  return {
    id: data.id,
    title: data.title,
    cards: [],
  };
}

export async function apiRenameColumn(columnId: string, title: string): Promise<void> {
  const res = await fetch(`/api/board/columns/${columnId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename column");
}

export async function apiDeleteColumn(columnId: string): Promise<void> {
  const res = await fetch(`/api/board/columns/${columnId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete column");
}

export async function apiCreateCard(columnId: string, title: string, details: string): Promise<Card> {
  const res = await fetch("/api/board/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ column_id: columnId, title, details }),
  });
  if (!res.ok) throw new Error("Failed to create card");
  const data: ApiCard = await res.json();
  return {
    id: data.id,
    title: data.title,
    details: data.details,
  };
}

export async function apiUpdateCard(cardId: string, title: string, details: string): Promise<void> {
  const res = await fetch(`/api/board/cards/${cardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, details }),
  });
  if (!res.ok) throw new Error("Failed to update card");
}

export async function apiMoveCard(cardId: string, targetColumnId: string, position: number): Promise<void> {
  const res = await fetch(`/api/board/cards/${cardId}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_column_id: targetColumnId, position }),
  });
  if (!res.ok) throw new Error("Failed to move card");
}

export async function apiDeleteCard(cardId: string): Promise<void> {
  const res = await fetch(`/api/board/cards/${cardId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete card");
}
