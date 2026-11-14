# راهنمای ساختار و معماری فرانت‌اند (Frontend Architecture Guide)

این مستند ساختار فعلی، کامپوننت‌ها و جریان داده‌های اپلیکیشن موجود در پوشه `frontend/` را توصیف می‌کند.

## ۱. مرور کلی و پشته فنی

پروژه فرانت‌اند یک اپلیکیشن مدرن Next.js است که با هدف ارائه برد کانبان تعاملی پیاده‌سازی شده است.

- فریم‌ورک اصلی: Next.js (نسخه 16.4.5) با ساختار App Router
- کتابخانه رابط کاربری: React (نسخه 19.3.0)
- سیستم استایل‌دهی: Tailwind CSS (نسخه 3.4.17)
- درگ و دراپ (Drag and Drop): `@hello-pangea/dnd`
- آیکون‌ها: `lucide-react`
- فریم‌ورک تست واحد: Vitest با Happy-DOM و Testing Library
- فریم‌ورک تست انتها به انتها (E2E): Playwright

## ۲. ساختار پوشه‌ها و فایل‌ها

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # لایه‌بندی ریشه و فونت‌ها
│   │   ├── page.tsx           # صفحه اصلی برنامه (نقطه ورود برد کانبان)
│   │   └── globals.css        # استایل‌های سراسری
│   ├── components/
│   │   ├── KanbanBoard.tsx    # کامپوننت اصلی برد و مدیریت وضعیت
│   │   ├── KanbanColumn.tsx   # نمایش هر ستون، فرم تغییر نام و دراپ زون
│   │   ├── KanbanCard.tsx     # نمایش هر کارت و قابلیت کشیدن (Draggable)
│   │   ├── AddCardModal.tsx   # مودال ایجاد کارت جدید
│   │   ├── GridSettingsModal.tsx # مودال تنظیمات شبکه بصری پیش‌نمایش
│   │   ├── Header.tsx         # هدر بالای صفحه و ابزارها
│   │   └── KanbanBoard.test.tsx # تست‌های واحد کامپوننت برد
│   ├── data/
│   │   └── initialData.ts     # داده‌های اولیه ماک برای ستون‌ها و کارت‌ها
│   ├── types/
│   │   └── kanban.ts          # تایپ‌ها و اینترفیس‌های داده‌ای برد
│   └── test/
│       └── setup.ts           # پیکربندی محیط تست Vitest
├── e2e/
│   └── kanban.spec.ts         # تست‌های انتها به انتها با Playwright
├── package.json               # وابستگی‌ها و اسکریپت‌های اجرا و ساخت
└── next.config.ts             # تنظیمات Next.js
```

## ۳. کامپوننت‌ها و وظایف آن‌ها

### ۳.۱. `page.tsx`
نقطه ورود ریشه در ساختار App Router که کامپوننت `KanbanBoard` را در بدنه صفحه بارگذاری می‌کند.

### ۳.۲. `KanbanBoard.tsx`
هسته مرکزی فرانت‌اند که وضعیت‌های زیر را نگهداری می‌کند:
- ستون‌ها و کارت‌ها (`columns`)
- باز/بسته بودن مودال ایجاد کارت و ستون هدف
- وضعیت باز/بسته بودن تنظیمات
- رسیدگی به رویداد `onDragEnd` جهت جابه‌جایی کارت‌ها درون یک ستون یا بین ستون‌های مختلف

### ۳.۳. `KanbanColumn.tsx`
وظیفه رندر ستون‌های مجزا در برد را بر عهده دارد:
- پیاده‌سازی محدوده رها کردن کارت (`Droppable`)
- فرم درون‌خطی تغییر نام ستون با کلیک روی عنوان یا دکمه ویرایش
- دکمه افزودن کارت مستقیم به انتهای همان ستون

### ۳.۴. `KanbanCard.tsx`
نمایش دهنده هر کارت منفرد به عنوان یک آیتم قابل کشیدن (`Draggable`):
- نمایش عنوان و جزئیات کارت
- دکمه حذف کارت

### ۳.۵. `AddCardModal.tsx`
فرم مدال شناور برای دریافت عنوان و توضیحات کارت جدید و افزودن آن به ستون انتخابی.

### ۳.۶. `Header.tsx`
نوار بالایی شامل عنوان اپلیکیشن، نشانگرهای آماری تعداد ستون‌ها و کارت‌ها، و دکمه‌های کنترلی.

## ۴. مدل داده (`types/kanban.ts`)

- `Card`: شامل `id`، `title` و `details`.
- `Column`: شامل `id`، `title` و آرایه‌ای از `Card`.
- `ColumnsMap`: نگاشت شناسه‌های ستون به آبجکت `Column`.

## ۵. محدودیت‌ها و موارد خارج از محدوده (Out of Scope) در نسخه فعلی

- اتصال زنده به بک‌اند: نسخه فعلی داده‌ها را در حافظه سمت مرورگر نگه می‌دارد.
- ورود و احراز هویت: فرم ورود هنوز به ساختار متصل نشده است.
- چت هوش مصنوعی: نوار گفت‌وگو هنوز پیاده‌سازی نشده است.
- حذف و جابه‌جایی ستون‌ها: در نیازمندی‌های نهایی MVP خارج از محدوده است.
- ذخیره تاریخچه چت: تاریخچه پس از تازه‌سازی صفحه (refresh) نباید ذخیره شود.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
