# Sistema de Seguimiento de Órdenes de Compra

Sistema web para gestionar y dar seguimiento a órdenes de compra, construido con **Next.js** y **Google Sheets** como base de datos.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración de Google Sheets

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilita la API de Google Sheets v4
3. Crea credenciales OAuth2 (ID de cliente de aplicación web)
4. Obtén un `refresh_token` con acceso offline
5. Configura las variables en `.env.local`:

```env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REFRESH_TOKEN=tu_refresh_token
GOOGLE_SHEET_ID=id_de_tu_sheet
GOOGLE_SHEET_NAME=Ordenes
```

> **Sin Google Sheets configurado**, la app funciona con datos mock de ejemplo.

## 📁 Estructura del Proyecto

```
app/
├── layout.js                 # Layout raíz
├── page.js                   # Dashboard
├── globals.css               # Design system
├── ordenes/
│   ├── page.js               # Lista de OC
│   └── nueva/page.js         # Formulario nueva OC
└── api/ordenes/
    ├── route.js              # GET + POST
    └── [id]/route.js         # PUT + DELETE
components/
├── layout/                   # Sidebar, Header, AppShell
├── ordenes/                  # Tabla, Form, StatusBadge
└── ui/                       # Button, Input, Modal, Toast, etc.
lib/
├── google-sheets.js          # Cliente Google Sheets OAuth2
└── constants.js              # Estados, formateadores, mock data
hooks/
├── useOrdenes.js             # CRUD hook
└── useToast.js               # Notificaciones
```

## 🎨 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **Google Sheets API v4** (OAuth2)
- **Vanilla CSS** (Glassmorphism dark theme)
- **Vercel** (deployment)

## 📄 Licencia

Proyecto interno de uso organizacional.
