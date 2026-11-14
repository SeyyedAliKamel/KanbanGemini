# راهنمای استقرار در فضای ابری (Cloud Deployment Guide)

این پروژه به گونه‌ای معماری شده است که تمام اجزای فرانت‌اند Next.js و بک‌اند FastAPI در قالب یک کانتینر واحد Docker اجرا می‌شوند. برای حفظ دائمی پایگاه داده SQLite و عملکرد کامل هوش مصنوعی، سرویس‌های میزبانی کانتینر نظیر **Railway** یا **Render** بهترین گزینه هستند.

---

## ۱. استقرار در Railway (پیشنهادی)

سرویس Railway به طور خودکار فایل `Dockerfile` و `railway.json` موجود در این مخزن را شناسایی و اجرا می‌کند.

### مراحل استقرار:
1. وارد حساب کاربری خود در [railway.app](https://railway.app) شوید.
2. روی **New Project** کلیک کرده و گزینه **Deploy from GitHub repo** را انتخاب کنید.
3. مخزن پروژه (`KanbanGemini`) را انتخاب کنید.
4. در تب **Variables** متغیر زیر را اضافه کنید:
   - `OPENROUTER_API_KEY`: کلید API اختصاصی شما برای مدل هوش مصنوعی.
5. (اختیاری جهت ماندگاری دائم داده‌ها):
   - در داشبورد پروژه، یک **Volume** ایجاد کرده و مسیر Mount آن را برابر با `/data` قرار دهید.
   - متغیر محیطی `DATABASE_PATH=/data/kanban.db` را ثبت کنید.
6. در بخش Settings یک دامنه عمومی (Generate Domain) ایجاد کنید.
7. برنامه شما با آدرس عمومی فعال و قابل استفاده خواهد بود.

---

## ۲. استقرار در Render

فایل `render.yaml` در ریشه مخزن قرار دارد و مشخصات سرویس و سلامت‌سنجی (`healthCheckPath: /api/health`) را تعیین می‌کند.

### مراحل استقرار:
1. وارد حساب کاربری خود در [render.com](https://render.com) شوید.
2. روی دکمه **New +** کلیک کرده و گزینه **Web Service** را انتخاب کنید.
3. مخزن گیت‌هاب خود را متصل کنید.
4. تنظیمات ساخت:
   - **Environment**: Docker
   - **Dockerfile Path**: Dockerfile
5. در بخش **Environment Variables**:
   - `OPENROUTER_API_KEY`: کلید API شما
   - `DATABASE_PATH`: `/data/kanban.db`
6. در بخش **Disks** یک دیسک با حجم ۱ گیگابایت در مسیر `/data` متصل کنید.
7. روی **Deploy Web Service** کلیک کنید. پس از پایان ساخت، برنامه زنده خواهد شد.

---

## ۳. بررسی سلامت سرویس

پس از بالا آمدن سرور در هر پلتفرم، می‌توانید با مراجعه به مسیر زیر سلامت API را بررسی کنید:
```
GET https://<your-deployed-domain>/api/health
```
پاسخ مورد انتظار:
```json
{
  "status": "ok",
  "message": "Backend API is functional",
  "version": "0.1.0"
}
```
ورود به سیستم با نام کاربری `user` و رمز عبور `password` انجام می‌شود.
