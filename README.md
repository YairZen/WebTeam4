# TeamInsight – README

## Contents
1. AI – Team Free Chat & Guided Reflection (Gemini)
2. Project Structure
3. Database Entities (MongoDB / Mongoose)
4. Entity Relationships
5. Constraints
6. Backend (API Routes)
7. Data Flow
8. Lecturer UI Architecture
9. Environment Setup & Dependencies
10. Roadmap

---

## 1) AI – Team Free Chat & Guided Reflection (Gemini)

TeamInsight provides two AI-based experiences powered by Gemini:

### A) Team Free Chat
**Goal:** Free-form team conversation for practical advice, day-to-day collaboration issues, and execution improvements.  
**Behavior:** The AI may answer directly. If essential context is missing, it asks one clarifying question.  
**State:** Per-tab (UI state can survive refresh). Closing the tab/window may end the conversation.  
**UI:** `/team/chat`  
**API:** `POST /api/team/ai/free`

### B) Guided Reflection (DB-driven)
**Goal:** A structured reflection flow with a fixed question order (weekly/periodic).  
**Rule:** The assistant asks exactly one question per message.  
**Flow control:** The server/database controls progression using `currentIndex` + `REFLECTION_QUESTIONS`.  
**Session per tab:** Each browser tab has its own `sessionId` (parallel reflections are supported).  
**Persistence:** Stored in MongoDB (answers, status, summary) to support insights later.  
**UI:** `/team/reflection`  
**API:**
- `POST /api/team/reflection/start`
- `POST /api/team/reflection/message`
- `POST /api/team/reflection/submit`

### Gemini prompts and runtime locations
- `lib/ai/prompts.ts` – prompts (written in English); assistant output is Hebrew.
- `lib/ai/gemini.ts` – Gemini wrapper (`@google/genai`) and helper functions.
- `lib/reflection/questions.ts` – reflection questions and ordering used by the server/DB.

---

## 2) Project Structure

### Frontend (Next.js App Router)
- `app/`
  - `app/team/`
    - Public:
      - `app/team/(public)/join/page.tsx` – team login (Team ID + Access Code)
      - `app/team/(public)/layout.tsx`
    - Protected:
      - `app/team/(protected)/layout.tsx` – wraps protected pages with `TeamGate`
      - `app/team/(protected)/page.tsx` – team home
      - `app/team/(protected)/chat/page.tsx` – team free chat UI
        - `app/team/(protected)/chat/Chat.tsx`
      - `app/team/(protected)/reflection/page.tsx` – guided reflection UI
        - `app/team/(protected)/reflection/ReflectionChat.tsx`
      - `app/team/(protected)/messages/page.tsx` – threads UI (team ↔ lecturer)
      - `app/team/(protected)/info/page.tsx` – team info UI
    - Shared:
      - `app/team/_components/TeamGate.tsx` – protects team routes using `GET /api/team/me`
      - `app/team/_components/TeamTabs.tsx` – navigation tabs

### Backend (API Routes – Next.js App Router)
- `app/api/`
  - Global:
    - `app/api/alerts/route.js`
    - `app/api/announcements/route.js`
    - `app/api/analytics/teams/route.js`
    - `app/api/analytics/compare/route.js`
    - `app/api/lecturer/login/route.js`
    - `app/api/reflections/route.js`
  - Team-scoped (cookie auth):
    - `app/api/team/join/route.js`
    - `app/api/team/me/route.js`
    - `app/api/team/messages/route.js`
    - `app/api/team/messages/[threadId]/route.js`
    - AI (Gemini):
      - `app/api/team/ai/free/route.ts`
      - `app/api/team/ai/feedback/route.ts`
    - Guided reflection:
      - `app/api/team/reflection/start/route.ts`
      - `app/api/team/reflection/message/route.ts`
      - `app/api/team/reflection/submit/route.ts`
  - Lecturer/admin team endpoints:
    - `app/api/teams/route.js`
    - `app/api/teams/[teamId]/route.js`
    - `app/api/teams/[teamId]/insights/route.js`
    - `app/api/teams/[teamId]/alerts/route.js`
    - `app/api/teams/[teamId]/chat/route.js`
    - `app/api/teams/[teamId]/reflections/route.js`

### Server utilities
- `lib/`
  - `lib/db.js` – MongoDB connection (Mongoose)
  - `lib/teamSession.js` – signing/verifying the `team_session` cookie
  - `lib/ai/` – Gemini integration
    - `lib/ai/gemini.ts`
    - `lib/ai/prompts.ts`
  - `lib/reflection/questions.ts` – reflection questions list/order

### Database models (Mongoose)
- `models/`
  - `Alert.js`
  - `Announcement.js`
  - `ChatSession.js`
  - `Lecturer.js`
  - `MessageThread.js`
  - `MessageMessage.js`
  - `Reflection.js`
  - `ReflectionChatSession.js`
  - `Team.js`

---

## 3) Database Entities (MongoDB / Mongoose)

### Lecturer
- email, passwordHash, timestamps

### Team
- teamId, projectName, accessCode, contactEmail, members, status, timestamps

### Reflection
- teamId, memberId, answers (length 5), freeText, timestamps

### ReflectionChatSession
- teamId, sessionId
- status: in_progress | ready_to_submit | submitted
- currentIndex
- messages[] (role, text, timestamps)
- answers[] (questionId, prompt, answer, timestamps)
- aiSummary
- timestamps

### ChatSession
- teamId (unique), messages[], timestamps

### MessageThread
- teamId, subject
- lastMessageAt, lastMessageText, lastMessageRole
- unreadForTeam, unreadForLecturer
- status: open | closed
- timestamps

### MessageMessage
- threadId, teamId, role, text, timestamps

### Alert / Announcement
- standard administrative entities for monitoring and broadcast.

---

## 4) Entity Relationships

- Team → Reflection (one-to-many)
- Team → ReflectionChatSession (one-to-many)
- Team → ChatSession (per team stored history)
- Team → MessageThread (one-to-many)
- MessageThread → MessageMessage (one-to-many)
- Team → Alert (one-to-many)
- Announcement → Team (broadcast by list or "all")

---

## 5) Constraints

- `Team.teamId` is unique.
- `ReflectionChatSession`: (`teamId`, `sessionId`) is unique.
- `ReflectionChatSession.currentIndex` defines the active question.
- `MessageThread.teamId` is required and indexed.
- `MessageMessage.threadId` is required.

---

## 6) Backend (API Routes)

### Authentication
- `POST /api/lecturer/login`

### Team (cookie auth)
- `POST /api/team/join` – validates teamId + accessCode, sets `team_session` (httpOnly)
- `GET /api/team/me` – returns the authenticated team by `team_session`

### Team AI (Gemini)
- `POST /api/team/ai/free`
- `POST /api/team/ai/feedback`

### Guided Reflection
- `POST /api/team/reflection/start`
- `POST /api/team/reflection/message`
- `POST /api/team/reflection/submit`

### Team messages (threads)
- `GET /api/team/messages`
- `POST /api/team/messages`
- `GET /api/team/messages/[threadId]`
- `POST /api/team/messages/[threadId]`

### Lecturer/admin teams
- `GET /api/teams`
- `GET /api/teams/[teamId]`
- `PUT /api/teams/[teamId]`
- `GET /api/teams/[teamId]/insights`
- `GET /api/teams/[teamId]/alerts`
- `GET /api/teams/[teamId]/chat`
- `POST /api/teams/[teamId]/chat`
- `GET /api/teams/[teamId]/reflections`

### Global
- `POST /api/alerts`
- `GET/POST /api/announcements`
- `GET /api/analytics/teams`
- `GET /api/analytics/compare`
- `POST /api/reflections`

---

## 7) Data Flow

### Team authentication (cookie session)
1. UI calls `POST /api/team/join`.
2. Server sets `team_session` (httpOnly).
3. Protected pages validate via `GET /api/team/me` (used by `TeamGate.tsx`).

### Team Free Chat
1. UI at `/team/chat` sends messages to `POST /api/team/ai/free`.
2. Server calls Gemini and returns assistant text.
3. UI holds per-tab state.

### Guided Reflection (DB-driven)
1. UI at `/team/reflection` creates/holds a `sessionId`.
2. UI calls `POST /api/team/reflection/start`.
3. Each user answer goes to `POST /api/team/reflection/message`.
4. Server loads `ReflectionChatSession`, reads `currentIndex`, selects questions from `lib/reflection/questions.ts`.
5. Server stores structured answers and progresses `currentIndex`.
6. Summary can be produced and stored, then finalized via `POST /api/team/reflection/submit`.

---

## 8) Lecturer UI Architecture

The lecturer interface is implemented using Next.js App Router and React components.
Main component groups:
- GUI components (inputs, tables, charts)
- Authentication/profile
- Teams overview & details (insights, alerts, reflections, chat history)
- Announcements
- Analytics

Architecture diagram:
<img width="1911" height="650" alt="image" src="https://github.com/user-attachments/assets/05ad4d96-5cae-40a4-89e0-69d665dda3d1" />

---

## 9) Environment Setup & Dependencies

### Environment variables
Create/update `.env` at the project root:
- `TEAM_SESSION_SECRET=...`
- `GEMINI_API_KEY=...`

### Required dependencies
- Next.js (App Router)
- Mongoose (MongoDB)
- Gemini SDK: `@google/genai`
- Chart libraries (used by lecturer UI): `chart.js`, `react-chartjs-2`, `recharts`

### Install
```bash
npm install
npm install @google/genai
npm install chart.js react-chartjs-2 recharts
