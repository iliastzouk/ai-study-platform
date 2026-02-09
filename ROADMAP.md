# AI Study Platform – Roadmap & Deferred Decisions

This document tracks design decisions, improvements, and features
that were intentionally postponed during development.

The goal is to keep the codebase clean while preserving architectural intent.

---

## 🔐 Authentication & Authorization

- [ ] Admin role bypass for viewing unpublished courses (RLS policy)
- [ ] Redirect authenticated users away from `/login`
- [ ] Passwordless auth UX improvements (resend link, cooldown)
- [ ] Logout redirect behavior

---

## 📚 Courses & Learning Flow

- [ ] Course enrollment guard at DB or API level
- [ ] Lock/unlock modules based on progress
- [ ] Course completion logic
- [ ] Course progress aggregation (per module, per course)
- [ ] Course prerequisites

---

## 🧠 Learning & AI Evaluation

- [ ] Separate `user_answers` table (instead of overloading `user_progress`)
- [ ] AI-based answer evaluation service (Cloudflare Worker)
- [ ] Feedback explanations for incorrect answers
- [ ] Adaptive difficulty based on user performance

---

## 🎨 UI / UX Improvements

- [ ] App layout with navigation shell
- [ ] Loading skeletons instead of plain text
- [ ] Error boundary component
- [ ] Toast notifications
- [ ] Dark mode

---

## 🧱 Architecture & Tech Debt

- [ ] Introduce React Router layout + `<Outlet />`
- [ ] Centralized API service layer
- [ ] Pagination & caching strategy for Supabase queries
- [ ] Admin dashboard
- [ ] Monorepo tooling (workspaces / turborepo)

---

## 🚀 Deployment & Ops

- [ ] Environment-based config (dev / staging / prod)
- [ ] CI pipeline
- [ ] Supabase migrations automation
- [ ] Cloudflare Workers deployment

⚠️ ΜΙΚΡΑ POLISH (προαιρετικά – όχι αλλαγές τώρα)

Δεν χρειάζεται να αλλάξεις τίποτα για να προχωρήσουμε, αλλά να τα ξέρεις:

🔹 Θα μπορούσαμε να κάνουμε parallel fetch (course + modules)

🔹 Θα μπορούσαμε να ελέγξουμε enrollment (locked/unlocked)

🔹 Θα μπορούσαμε να βγάλουμε Course not found σε 404 route

👉 ΣΩΣΤΑ ΔΕΝ τα έκανες τώρα. Αυτά μπαίνουν στο roadmap.