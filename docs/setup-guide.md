# Frontend Setup Guide

Use this guide when setting up the frontend locally.

## Requirements

- Node.js `20.19+` or `22.12+`
- Running backend API

## Install

```bash
npm install
```

## Environment

Create local `.env`:

```bash
cp .env.example .env
```

Expected value:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Change the port if the backend runs on a different port.

## Run

Start frontend development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Backend Pairing

The frontend expects backend auth responses to include:

- `data.token`
- `data.user`
- `user.role`

If the backend response shape changes, update `src/modules/auth/store/authStore.js` and `src/shared/services/api.js`.
