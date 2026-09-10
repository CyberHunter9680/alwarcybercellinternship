# 🛡️ Alwar Police Cyber Security Internship Portal 2026

Official internship application and officer review portal for the **Alwar Police (Rajasthan Police)** Cyber Defense Cell.

Developed by **Abhishek Sharma**.

---

## 🌟 Key Features

- **🏛️ Rajasthan Police Branding**: Official emblem, high-contrast police cyber color palette (Navy Blue, Royal Gold, Cyber Cyan), responsive for mobile & desktop.
- **⚡ Real-Time Database**: Connected to **Neon Serverless PostgreSQL** database. Zero dummy/fake data.
- **🛡️ Enterprise-Grade Security**:
  - **SQL Injection Prevention**: 100% Parameterized queries with `pg`.
  - **XSS Sanitization**: Input cleaning and safe character escaping.
  - **Rate Limiting**: Sliding-window IP rate limiter to block bot spam and DoS attacks.
  - **Payload Limits**: Strict 5MB file upload cap and character length constraints.
  - **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, CSP.
- **🔒 Protected Officer Portal**: Hidden `/admin` and `#admin` route with PIN authentication (`1122`).
- **👁️ Resume Preview & Download**: In-browser PDF/Document viewer modal with one-click download.
- **🗑️ Real-Time Record Management**: Permanent deletion with instant database sync.
- **📊 Excel / CSV Export**: One-click download of all verified applicant data.

---

## 📂 Project Structure

```
├── .env.example            # Environment variables template
├── .gitignore              # Ignored files (node_modules, .env)
├── api/
│   ├── applicants.js       # Vercel serverless API (GET, POST, DELETE, PATCH)
│   └── db.js               # Neon PostgreSQL connection pool helper
├── assets/
│   └── Rajasthan-Police.webp # Official Rajasthan Police emblem
├── index.html              # Registration Form & Admin Dashboard views
├── migrate.js              # Database table and index initialization script
├── package.json            # Node.js dependencies
├── styles.css              # Custom styling with Glassmorphism & Police theme
├── vercel.json             # Vercel routing configuration
└── app.js                  # Frontend client application logic
```

---

## 🚀 Deployment on Vercel

1. **Import Repository** into Vercel from GitHub: `https://github.com/CyberHunter9680/alwarcybercellinternship`
2. **Set Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `ADMIN_PIN`: `1122`
3. **Deploy**!

---

## 🔑 Accessing the Admin Dashboard

1. Navigate to: `https://your-domain.vercel.app/#admin` (or `/admin`)
2. Enter Officer Security PIN: `1122`

---

## 👨‍💻 Developer

**Abhishek Sharma**  
*Alwar Police Cyber Security Internship Project 2026*
