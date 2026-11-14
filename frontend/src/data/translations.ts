export type Language = "en" | "fa";

export interface Translations {
  cyberTitle: string;
  matrixTitle: string;
  kanbanBadge: string;
  nodeStatus: string;
  synchronized: string;
  lanesConfigured: string;
  gridHud: string;
  lanes: string;
  activeUnits: string;
  addLane: string;
  newLanePlaceholder: string;
  addUnit: string;
  unitTitle: string;
  unitDetails: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  dragHint: string;
  columnsLayout: string;
  gridOpacity: string;
  gridSize: string;
  gridColor: string;
  close: string;
  languageToggle: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    cyberTitle: "CYBER",
    matrixTitle: "MATRIX",
    kanbanBadge: "KANBAN",
    nodeStatus: "NODE_STATUS:",
    synchronized: "SYNCHRONIZED",
    lanesConfigured: "LANES CONFIGURED",
    gridHud: "GRID HUD",
    lanes: "LANES",
    activeUnits: "ACTIVE UNITS:",
    addLane: "ADD LANE",
    newLanePlaceholder: "Lane Title...",
    addUnit: "ADD UNIT",
    unitTitle: "Card Title",
    unitDetails: "Card Details",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    dragHint: "DRAG / DROP UNIT",
    columnsLayout: "Columns Per Row",
    gridOpacity: "Grid Opacity",
    gridSize: "Grid Size",
    gridColor: "Accent Color",
    close: "Close",
    languageToggle: "فارسی",
  },
  fa: {
    cyberTitle: "سایبر",
    matrixTitle: "ماتریس",
    kanbanBadge: "کانبان",
    nodeStatus: "وضعیت سیستم:",
    synchronized: "همگام",
    lanesConfigured: "ستون فعال",
    gridHud: "تنظیمات شبکه",
    lanes: "ستون",
    activeUnits: "کارت‌های فعال:",
    addLane: "افزودن ستون",
    newLanePlaceholder: "عنوان ستون...",
    addUnit: "افزودن کارت",
    unitTitle: "عنوان کارت",
    unitDetails: "توضیحات کارت",
    save: "ذخیره",
    cancel: "انصراف",
    delete: "حذف",
    edit: "ویرایش",
    dragHint: "انتقال با کشیدن و رها کردن",
    columnsLayout: "تعداد ستون در ردیف",
    gridOpacity: "شفافیت شبکه",
    gridSize: "ابعاد شبکه",
    gridColor: "رنگ تأکیدی",
    close: "بستن",
    languageToggle: "English",
  },
};
