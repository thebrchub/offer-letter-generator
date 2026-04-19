# Offer Letter Generator — Project Plan

## Repository
- **Remote**: `https://github.com/thebrchub/offer-letter-generator.git`
- **Local git config** (override for this repo only):
  ```bash
  git config --local user.email "shivanand-burli@users.noreply.github.com"
  ```

---

## Tech Stack
- React 18 + Vite + Tailwind CSS
- `html2pdf.js` (or `jsPDF` + `html2canvas`) for PDF export
- LocalStorage for saving drafts/templates (limit ~5MB — store JSON config + base64 logos under ~2MB)
- TipTap (rich text editor) for the body editor — lightweight, extensible, supports bold/italic/bullets/headings with a toolbar

---

## Core Features

### 1. Form Panel (Left Side — Canva-style editor)

| Field | Type | Default | Notes |
|---|---|---|---|
| Reference Number | Text (editable) | Auto: `BRC/OL/{year}/001` | Auto-generated with current year, sequential counter stored in localStorage. User can override. |
| Company Logo | File upload | — | Stored as base64 in localStorage only if <500KB after compression. If larger, silently skip storage (kept in memory for current session only). |
| Company Name | Text | `Blazing Render Creation Hub LLP` | |
| Company Address | Text | `Toranagallu, Ballari (dist.), Sandur (taluk), Karnataka - 583123` | Shown in header + footer |
| Company Website | Text | `www.thebrchub.tech` | Footer left |
| Company Email | Text | `info@thebrchub.tech` | Footer right |
| Candidate Name | Text | — | |
| Candidate Email | Text | — | |
| Position / Role | Text | — | Used in subject line + body |
| Engagement Type | Dropdown | Part-Time | Full-Time / Part-Time / Contract / Intern |
| Date | Date picker | Today's date (auto) | Pre-filled with current date; user can change if needed |
| Letter Heading/Title | Text | `OFFER LETTER` | |
| Body | Rich text editor (TipTap) | — | See Body Editor section below |
| Signatory Name | Text | — | e.g. "Benki" |
| Signatory Title | Text | — | e.g. "Co-Founder, CPPO" |
| Signatory Signature | File upload OR draw pad | — | Two options: upload image, or draw signature on canvas pad |
| Candidate Signature Placeholder | Toggle | ON | Show/hide candidate sign block on the letter |

### 2. Body Editor (TipTap Rich Text)
- **Full rich text editor** using TipTap with a floating/sticky toolbar:
  - Bold, Italic, Underline
  - Bullet list, Ordered list
  - Heading (for section titles — rendered as bold numbered headings)
  - Undo / Redo
- Section-based structure: each section has a **heading** (bold, auto-numbered) and **content**
- Add / Remove / Reorder sections via drag handle on each section block
- Large comfortable editing area — resizable, with enough height so user doesn't feel cramped
- Paste-friendly: user can paste from Word/Google Docs and formatting is preserved (TipTap handles this)
- Pre-built **templates** — e.g. "Sales Role", "Developer Role", "Intern" with default sections (Position, Probation, Compensation, Confidentiality, Termination, Work Culture, Acceptance). Selecting a template populates all sections.
- Auto page-splitting: measure rendered height, insert page breaks when content exceeds A4 height (~1045px at 96dpi)

### 3. Live Preview (Right Side)
- Real-time A4 preview matching the PDF output exactly
- Page numbers shown
- Zoom in/out controls

### 4. Styling / Customization (Canva-like toolbar)

| Option | Default | Notes |
|---|---|---|
| Accent strip color | `#F97316` (orange) | Color picker — applied to top/bottom strips |
| Header font | Bold serif/display | Dropdown with 4-5 professional options |
| Body font | Clean sans-serif | Dropdown |
| Font size (body) | 14px | Slider 12–18px |
| Watermark | Checkbox ON | Options: Auto-generate from logo (faded, centered, 30% opacity) OR upload custom image |
| Watermark opacity | 15% | Slider 5–40% |
| Strip style | Gradient | Solid / Gradient / None |

### 5. PDF Export
- "Download PDF" button — generates multi-page A4 PDF
- Filename auto-generated: `OfferLetter_[CandidateName]_[Date].pdf`
- Proper page breaks — header + footer + strips repeated on every page

### 6. LocalStorage Management
- **Save as Template**: Save the form config (company details, sections, styles) — NOT the candidate-specific data — as a reusable template
- **Save Draft**: Save current letter as a draft (auto-save every 30s)
- **Storage budget**: Show usage bar (used/5MB). Base64 images are the main cost — compress logos on upload (resize to max 400px width, JPEG quality 0.7). If logo exceeds 500KB after compression, don't persist to localStorage (session-only).
- **Export/Import config**: JSON export button so templates can be backed up or shared between machines
- **"Reset All Data"** button: Clears all localStorage (templates, drafts, styles, company profile). Labeled something friendly like "Start Fresh" with a confirmation dialog.

### 7. Polish Details (Anti-AI-slop)
- Header layout matches sample: logo left + company name right in bold display font + address subtitle
- Footer: globe icon + website on left, mail icon + email on right — thin separator line above
- Signature section: two-column layout, left = company signatory, right = candidate
- Consistent spacing, no random font mixing
- Print-friendly: `@media print` styles as fallback
- Subtle paper shadow on preview for realism

---

## Decisions (Resolved)

- **Signatory signature**: Both options — upload image OR draw on canvas pad (using a simple signature-pad library)
- **Company profiles**: Single company for now, but data model is a single object so it's easy to extend to an array of profiles later
- **Letter numbering**: Auto-generated as `BRC/OL/{currentYear}/001`. Counter stored in localStorage, increments per letter. User can always edit the field manually. Year auto-updates.

---

## File Structure

```
src/
├── App.jsx                    # Layout: form + preview side-by-side
├── main.jsx
├── index.css                  # Tailwind + custom print styles
├── components/
│   ├── FormPanel.jsx          # All form inputs
│   ├── SectionEditor.jsx      # Body sections add/edit/reorder (TipTap)
│   ├── StyleToolbar.jsx       # Colors, fonts, watermark
│   ├── Preview.jsx            # Live A4 preview container
│   ├── LetterPage.jsx         # Single A4 page (header/body/footer)
│   ├── SignatureBlock.jsx     # Signatory layout + draw pad
│   └── StorageManager.jsx     # Save/load templates & drafts + "Start Fresh" button
├── hooks/
│   ├── useLocalStorage.js     # Read/write with size tracking
│   └── usePageSplit.js        # Measure content, compute page breaks
├── utils/
│   ├── pdfExport.js           # html2pdf wrapper
│   ├── imageCompress.js       # Resize + compress uploaded images
│   ├── templates.js           # Default section templates
│   └── refNumber.js           # Auto-generate BRC/OL/{year}/NNN
└── assets/
    └── icons/                 # Globe, mail SVGs for footer
```

---

## LocalStorage Budget

| Key | Size Estimate | Content |
|---|---|---|
| `olg_company_profile` | ~50KB | Logo (compressed base64, only if <500KB), name, address, email, website, signature image |
| `olg_templates` | ~10KB each | Array of saved section templates (JSON text only) |
| `olg_drafts` | ~20KB each | Current letter drafts (max 5, oldest auto-pruned) |
| `olg_styles` | ~1KB | Color, font, watermark preferences |
| `olg_ref_counter` | ~100B | `{ year: 2026, counter: 1 }` for auto-incrementing reference numbers |
| **Total target** | **<2MB** | Leaves headroom under the 5MB limit |

---

## Implementation Order

### Phase 1 — Skeleton & Preview
1. Scaffold Vite + React + Tailwind project
2. Build basic two-panel layout (form left, preview right)
3. Create LetterPage component matching sample PDF (header, orange strips, footer)
4. Wire up form fields to live preview
5. Auto-fill defaults (company name, address, website, email, today's date, ref number)

### Phase 2 — Body Editor & Page Splitting
6. Integrate TipTap rich text editor with toolbar (bold, italic, bullets, headings, undo/redo)
7. Build SectionEditor with add/remove/reorder (drag handles)
8. Implement auto page-split logic (measure height, break across pages)
9. Add default section templates (Sales, Developer, Intern)

### Phase 3 — Styling & Customization
10. Color picker for accent strips
11. Font selector (header + body)
12. Watermark toggle (auto from logo / custom upload)
13. Font size slider

### Phase 4 — PDF Export
14. Integrate html2pdf.js
15. Multi-page export with repeated headers/footers
16. Auto filename generation

### Phase 5 — Signatures & Ref Numbers
17. Signature upload option
18. Signature draw-on-canvas option
19. Auto reference number generation (`BRC/OL/{year}/NNN`) with editable field

### Phase 6 — Storage & Templates
20. LocalStorage save/load for drafts
21. Template save/load system
22. Auto-save every 30s
23. Storage usage indicator
24. JSON export/import for backup
25. "Start Fresh" button to clear all data

### Phase 7 — Polish
26. Image compression on upload (skip localStorage if still >500KB)
27. Signature block layout (two-column)
28. Print CSS fallback
29. Responsive design tweaks
30. Edge case handling (empty fields, oversized images)
