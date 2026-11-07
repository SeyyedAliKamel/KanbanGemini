export interface Card {
  id: string;
  title: string;
  details: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export type ColumnsLayout = "scroll" | "2" | "3" | "4" | "5" | "fit";

export interface GridSettings {
  visible: boolean;
  size: number;
  opacity: number;
  color: "cyan" | "magenta" | "yellow";
  columnsPerRow: ColumnsLayout;
}

export type ColumnsMap = Record<string, Column>;
