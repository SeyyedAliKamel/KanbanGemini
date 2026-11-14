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
  loginTitle: string;
  loginSubtitle: string;
  username: string;
  password: string;
  loginBtn: string;
  loggingIn: string;
  invalidCredentials: string;
  logout: string;
  userBadge: string;
  aiAssistant: string;
  aiSubtitle: string;
  aiPlaceholder: string;
  aiSend: string;
  aiThinking: string;
  aiQuickPrompt1: string;
  aiQuickPrompt2: string;
  aiQuickPrompt3: string;
  aiAppliedBadge: string;
  aiToggleBtn: string;
  aiClearChat: string;
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
    loginTitle: "ACCESS AUTHORIZATION",
    loginSubtitle: "Sign in with user / password to unlock the workspace",
    username: "Username",
    password: "Password",
    loginBtn: "AUTHENTICATE",
    loggingIn: "VERIFYING CREDENTIALS...",
    invalidCredentials: "Invalid credentials. Use user / password.",
    logout: "LOGOUT",
    userBadge: "OPERATOR:",
    aiAssistant: "AI ASSISTANT",
    aiSubtitle: "Manage cards with natural language",
    aiPlaceholder: "Command AI (e.g. Add card 'Sync DB' to Backlog)...",
    aiSend: "SEND",
    aiThinking: "PROCESSING...",
    aiQuickPrompt1: "Add card 'Network Patch' to first lane",
    aiQuickPrompt2: "Summarize status of all lanes",
    aiQuickPrompt3: "Move card-1 to the last column",
    aiAppliedBadge: "actions executed on board",
    aiToggleBtn: "AI COPILOT",
    aiClearChat: "RESET",
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
    loginTitle: "احراز هویت کاربر",
    loginSubtitle: "جهت دسترسی به تخته با user / password وارد شوید",
    username: "نام کاربری",
    password: "رمز عبور",
    loginBtn: "ورود به سیستم",
    loggingIn: "در حال بررسی اعتبارنامه...",
    invalidCredentials: "نام کاربری یا رمز عبور اشتباه است.",
    logout: "خروج",
    userBadge: "کاربر:",
    aiAssistant: "دستیار هوش مصنوعی",
    aiSubtitle: "مدیریت و سازماندهی کارت‌ها با زبان طبیعی",
    aiPlaceholder: "دستور خود را بنویسید (مثلاً: کارت جدید در ستون اول ایجاد کن)...",
    aiSend: "ارسال",
    aiThinking: "در حال پردازش...",
    aiQuickPrompt1: "یک کارت جدید به نام تست به ستون اول اضافه کن",
    aiQuickPrompt2: "وضعیت ستون‌ها و کارت‌ها را خلاصه کن",
    aiQuickPrompt3: "کارت اول را به ستون آخر منتقل کن",
    aiAppliedBadge: "عملیات روی برد اعمال شد",
    aiToggleBtn: "دستیار هوشمند",
    aiClearChat: "پاک‌سازی",
  },
};
