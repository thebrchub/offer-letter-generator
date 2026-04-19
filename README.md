# Offer Letter Generator

Internal tool for generating professional offer letters as PDF.

## Tech Stack
- React + Vite + Tailwind CSS v4
- TipTap rich text editor
- html2pdf.js for PDF export
- signature_pad for drawing signatures
- LocalStorage for drafts/templates

## Setup

```bash
npm install
npm run dev
```

## Features
- Live A4 preview with customizable header, footer, accent strips
- Rich text body editor with section-based structure
- Pre-built templates (Sales, Developer, Intern)
- Signature upload or draw-on-canvas
- Auto reference number generation
- PDF export with proper page breaks
- LocalStorage drafts, templates, and config backup
