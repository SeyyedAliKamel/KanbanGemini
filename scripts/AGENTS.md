# راهنمای اسکریپت‌های مدیریت سرور (Server Management Scripts)

این پوشه شامل اسکریپت‌های راه‌اندازی و متوقف‌کردن سرور برای سیستم‌عامل‌های مختلف (ویندوز، مک و لینوکس) است.

## ۱. لیست اسکریپت‌ها

- `start.ps1` و `stop.ps1`: اسکریپت‌های PowerShell برای سیستم‌عامل ویندوز
- `start.bat` و `stop.bat`: اسکریپت‌های Command Prompt برای سیستم‌عامل ویندوز
- `start.sh` و `stop.sh`: اسکریپت‌های شل متناسب با لینوکس و macOS

## ۲. نحوه استفاده

### سیستم‌عامل ویندوز (PowerShell):
```powershell
.\scripts\start.ps1
.\scripts\stop.ps1
```

### سیستم‌عامل ویندوز (CMD / Batch):
```cmd
scripts\start.bat
scripts\stop.bat
```

### سیستم‌عامل Linux و macOS:
```bash
chmod +x scripts/*.sh
./scripts/start.sh
./scripts/stop.sh
```

## ۳. رفتار اسکریپت‌ها

1. اسکریپت ابتدا بررسی می‌کند که آیا سرویس Docker در حال اجراست یا خیر.
2. در صورت فعال بودن داکر، ایمیج پروژه با استفاده از `docker compose up -d --build` ساخته و اجرا می‌شود.
3. در صورت عدم اجرای داکر، اسکریپت برای راحتی توسعه‌دهنده سرور بک‌اند را مستقیماً با `uvicorn` اجرا می‌کند.
4. سرور در آدرس `http://localhost:8000` در دسترس خواهد بود.
