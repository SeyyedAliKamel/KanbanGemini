# مستند طراحی و مشخصات پایگاه داده (Database Architecture & Specification)

این مستند ساختار، جداول، روابط و قوانین یکپارچگی داده‌ها را در پایگاه داده SQLite برای اپلیکیشن مدیریت پروژه کانبان شرح می‌دهد.

## ۱. تصمیم‌های طراحی

1. **پشتیبانی از ساختار چندکاربره (Multi-user Architecture)**:
   پایگاه داده برای پشتیبانی از چند کاربر طراحی شده است. هر کاربر دارای یک شناسه یکتا است و بردها به شناسه کاربر متصل هستند. در نسخه MVP، هر کاربر دارای ۱ برد پیش‌فرض است (`UNIQUE` بودن `user_id` در جدول `boards`). در نسخه‌های آینده، با حذف قید `UNIQUE`، امکان داشتن چند برد برای هر کاربر فراهم می‌شود.

2. **نوع شناسه‌ها (String Identifiers)**:
   برای تطابق کامل با کتابخانه درگ و دراپ فرانت‌اند (`@hello-pangea/dnd`) و اجتناب از تبدیل‌های پرخطای نوع داده، شناسه‌های ستون‌ها و کارت‌ها به‌صورت رشته‌ای (مانند `col-1` و `card-1` یا `col-uuid`) ذخیره می‌شوند.

3. **حفظ ترتیب عناصر (Ordering & Positions)**:
   ستون‌ها و کارت‌ها دارای فیلد عددی `position` هستند که ترتیب نمایش آن‌ها را با ایندکس مبتنی بر صفر مشخص می‌کند.

4. **حذف آبشاری (Cascade Deletion)**:
   با فعال‌سازی `PRAGMA foreign_keys = ON;` در SQLite، حذف یک ستون یا یک برد به‌صورت خودکار تمام کارت‌ها یا ستون‌های وابسته به آن را پاکسازی می‌کند تا هیچ رکورد یتیمی در دیتابیس باقی نماند.

## ۲. تعاریف جداول (DDL)

```sql
PRAGMA foreign_keys = ON;

-- جدول کاربران
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- جدول بردهای کانبان
CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- جدول ستون‌ها
CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT NOT NULL,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
);

-- جدول کارت‌ها
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    column_id TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (column_id) REFERENCES columns (id) ON DELETE CASCADE
);
```

## ۳. داده‌های اولیه (Initial Seed Data)

در اولین اجرای برنامه، اگر فایل پایگاه داده (`kanban.db`) وجود نداشته باشد:
1. کاربر پیش‌فرض با نام کاربری `user` و رمز عبور `password` ایجاد می‌شود.
2. یک برد پیش‌فرض با شناسه `brd-user` برای این کاربر ثبت می‌شود.
3. ستون‌های پیش‌فرض ۵ گانه (`col-1` تا `col-5`) ایجاد می‌شوند.
4. کارت‌های اولیه آزمایشی به ستون‌ها اضافه می‌شوند.

این فرآیند به‌صورت خودکار در ماژول مدیریت دیتابیس بک‌اند اجرا خواهد شد.
