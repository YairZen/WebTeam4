# TeamInsight – README

## Contents
1. AI – Chat & Guided Reflection (Gemini)
2. Project Structure
3. Database Entities
4. Database Entity Relationships
5. Constraints
6. Backend (API & Infrastructure)
7. Data Flow (Backend to Frontend)
8. Lecturer Client-Side Architecture
9. Environment Setup & Dependencies
10. Roadmap

---

## 1) AI – Chat & Guided Reflection (Gemini)

ב־TeamInsight יש שני מסלולי שימוש ב-AI (Gemini), עם מטרות שונות:

### A) Team Free Chat
**מטרה:** שיח חופשי לצוות (ייעוץ פרקטי, פתרון בעיות יום־יומיות, שיפור תהליך).  
**התנהגות:** ה-AI יכול לענות ישירות; אם חסר הקשר — שואל שאלת הבהרה אחת.  
**שמירה:** פר־טאב (כדי לשרוד Refresh). סגירת הטאב/חלון יכולה לסיים את השיחה.  
**UI:** `/team/chat`  
**API:** `POST /api/team/ai/free`

### B) Guided Reflection (DB-driven)
**מטרה:** תהליך מובנה של רפלקציה שבועית/תקופתית עם שאלות בסדר קבוע.  
**כללים:** בכל הודעה הבוט שואל שאלה אחת בלבד.  
**סדר השאלות:** נקבע ע״י השרת/DB בעזרת `currentIndex` + `REFLECTION_QUESTIONS`.  
**Session פר־טאב:** לכל טאב יש `sessionId` משלו (כדי לאפשר רפלקציות במקביל).  
**שמירה:** נשמר במסד (שאלות/תשובות, סטטוס, סיכום AI) לצורך הפקת תובנות.  
**UI:** `/team/reflection`  
**API:**
- `POST /api/team/reflection/start`
- `POST /api/team/reflection/message`
- `POST /api/team/reflection/submit`

### איפה מוגדרים ה-Prompts וההרצה של Gemini?
- `lib/ai/prompts.ts` – פרומפטים (כתובים באנגלית), הפלט והשיחה בעברית.
- `lib/ai/gemini.ts` – מעטפת עבודה עם Gemini והפונקציות הרלוונטיות.
- `lib/reflection/questions.ts` – רשימת השאלות לרפלקציה והסדר שלהן.

---

## 2) Project Structure

### Frontend (UI & Pages)
- `app/`
- `app/lecturer/`
- `app/team/`
  - Public:
    - `app/team/(public)/join/page.tsx` – Team login page (Team ID + Access Code)
  - Protected:
    - `app/team/(protected)/layout.tsx` – Protected team layout (wraps pages with `TeamGate`)
    - `app/team/(protected)/page.tsx` – Team home (loads team data from `GET /api/team/me`)
    - `app/team/(protected)/chat/page.tsx` – Team Free Chat page
      - `app/team/(protected)/chat/Chat.tsx`
    - `app/team/(protected)/reflection/page.tsx` – Team Guided Reflection page
      - `app/team/(protected)/reflection/ReflectionChat*.tsx`
    - `app/team/(protected)/info/page.tsx` – Team info page
    - `app/team/(protected)/messages/page.tsx` – Team messages (threads UI)
  - Shared components:
    - `app/team/_components/TeamGate.tsx` – route protection (calls `GET /api/team/me`)
    - `app/team/_components/TeamTabs.tsx` – team navigation tabs

### Backend (API Routes – Next.js App Router)
- `app/api/`

### Backend (Infrastructure & Shared Utilities)
- `lib/`
  - `lib/db.js` – MongoDB connection (Mongoose)
  - `lib/teamSession.js` – session signing/verification for the `team_session` cookie
  - `lib/ai/` – Gemini integration (`gemini.ts`, `prompts.ts`)
  - `lib/reflection/questions.ts` – reflection questions list/order

### Database Models (Mongoose)
- `models/` – schemas/collections
  - כולל מודלים קיימים, וגם מודלים למסרים ולרפלקציה מונחית.

### Database
- MongoDB Atlas (remote) accessed via Mongoose

---

## 3) Database Entities

> הפרויקט כולל מודלים קיימים לצד מודלים נוספים. כולם נשארים בפרויקט.

### Lecturer
**Description:** Represents the lecturer (admin) for authentication and receiving alerts.
- `_id`
- `email`
- `passwordHash`
- `createdAt`

### Team
**Description:** Represents a single project team. Interactions are performed at the team level.
- `_id`
- `teamId`
- `projectName`
- `accessCode`
- `contactEmail`
- `members: [{ memberId, displayName }]`
- `status`
- `createdAt`

### Reflection
**Description:** Personal feedback submission by a team member (stored for history/analysis).
- `_id`
- `teamId`
- `memberId`
- `answers` (length 5)
- `freeText`
- `createdAt`

### ReflectionChatSession
**Description:** Guided reflection conversation session (session per tab).
- `_id`
- `teamId`
- `sessionId`
- `status` (`in_progress` / `ready_to_submit` / `submitted`)
- `currentIndex`
- `messages: [{ role, text, createdAt }]`
- `answers: [{ questionId, prompt, answer, createdAt }]`
- `aiSummary`
- `createdAt`
- `updatedAt`

### Alert
**Description:** Abnormal system event and alert history.
- `_id`
- `teamId`
- `severity`
- `message`
- `emailTo`
- `emailStatus`
- `createdAt`

### Announcement
**Description:** Announcements/tasks from lecturer to teams.
- `_id`
- `title`
- `body`
- `targetTeams`
- `createdAt`

### ChatSession
**Description:** Stored chatbot conversation history per team (existing model).
- `_id`
- `teamId`
- `messages: [{ role, text, createdAt }]`
- `createdAt`
- `updatedAt`

### MessageThread
**Description:** Thread between a team and the lecturer (mail/board style).
- `_id`
- `teamId`
- `subject`
- `lastMessageAt`
- `lastMessageText`
- `lastMessageRole` (`team` / `lecturer`)
- `unreadForTeam`
- `unreadForLecturer`
- `status` (`open` / `closed`)
- `createdAt`
- `updatedAt`

### MessageMessage
**Description:** Single message inside a thread.
- `_id`
- `threadId`
- `teamId`
- `role` (`team` / `lecturer`)
- `text`
- `createdAt`

---

## 4) Database Entity Relationships

- **Team → Reflection** (One-to-Many)
- **Team → ReflectionChatSession** (One-to-Many)
- **Team → Alert** (One-to-Many)
- **Announcement → Team** (Broadcast by list / "all")
- **Team → ChatSession** (Per-team stored history)
- **Team → MessageThread** (One-to-Many)
- **MessageThread → MessageMessage** (One-to-Many)

---

## 5) Constraints

- `Team.teamId` must be unique.
- `memberId` must be unique within a specific team.
- ReflectionChatSession:
  - (`teamId`, `sessionId`) must be unique.
  - `currentIndex` defines the active reflection question.
- Messages:
  - `MessageThread.teamId` is required and indexed.
  - `MessageMessage.threadId` is required.

---

## 6) Backend (API & Infrastructure)

### Backend Overview
The backend is implemented using the Next.js App Router.
Responsibilities:
- MongoDB connection (Mongoose)
- Business logic
- API endpoints
- Gemini integration (AI)

### Team Authentication (Session Cookie)
After a successful `POST /api/team/join`, the server sets an httpOnly cookie named `team_session`.
This cookie authenticates subsequent requests (e.g., `GET /api/team/me`).

Session signing/verification:
- `lib/teamSession.js`

### Implemented API Routes

#### Authentication
- `POST /api/lecturer/login`

#### Team (cookie auth)
- `POST /api/team/join`
- `GET /api/team/me`

#### Team AI (Gemini)
- `POST /api/team/ai/free`
- `POST /api/team/ai/feedback`

#### Guided Reflection
- `POST /api/team/reflection/start`
- `POST /api/team/reflection/message`
- `POST /api/team/reflection/submit`

#### Teams (lecturer/admin view)
- `GET /api/teams`
- `GET /api/teams/[teamId]`
- `PUT /api/teams/[teamId]`
- `GET /api/teams/[teamId]/insights`
- `GET /api/teams/[teamId]/chat`
- `POST /api/teams/[teamId]/chat`

#### Team Messages
- `GET /api/team/messages`
- `POST /api/team/messages`
- `GET /api/team/messages/[threadId]`
- `POST /api/team/messages/[threadId]`

#### Reflections
- `POST /api/reflections`
- `GET /api/teams/[teamId]/reflections`

#### Alerts
- `POST /api/alerts`
- `GET /api/teams/[teamId]/alerts`

#### Announcements
- `POST /api/announcements`
- `GET /api/announcements`

#### Analytics
- `GET /api/analytics/teams`
- `GET /api/analytics/compare`

---

## 7) Data Flow (Backend to Frontend)

### High level
Frontend → Next.js API Route → Mongoose → MongoDB → API Response → Frontend

### Team Login Flow (Cookie Session)
1. Team submits `teamId` + `accessCode` via `POST /api/team/join`.
2. Server sets `team_session` (httpOnly cookie).
3. Protected UI calls `GET /api/team/me` via `TeamGate.tsx`.

### Free Chat Flow
1. Team opens `/team/chat`.
2. UI sends chat payload to `POST /api/team/ai/free`.
3. Gemini returns Hebrew text.
4. UI maintains local per-tab state (for Refresh resilience).

### Guided Reflection Flow (DB-driven)
1. Team opens `/team/reflection`.
2. UI holds a `sessionId` (per tab) and calls `POST /api/team/reflection/start`.
3. Each user answer goes to `POST /api/team/reflection/message` with `{ sessionId, text }`.
4. Server loads the session, reads `currentIndex`, selects questions from `lib/reflection/questions.ts`, and returns the next assistant message.
5. End:
   - The flow reaches the last question, and/or
   - Summary is generated and stored, and the session can be submitted via `POST /api/team/reflection/submit`.

---

## 8) Lecturer Client-Side Architecture

The lecturer interface is implemented using Next.js App Router and React components.
Component groups:
- GUIComponents – reusable UI elements (inputs, tables, charts, buttons)
- UserComponents – lecturer authentication and profile-related components
- TeamsComponents – team overview, team details, insights, alerts, reflections, chat history
- AnnouncementsComponents – publishing and viewing announcements/tasks
- AlertsComponents – alerts history and notifications
- Header – navigation menu and logout

Architecture diagram:
<img width="1911" height="650" alt="image" src="https://github.com/user-attachments/assets/05ad4d96-5cae-40a4-89e0-69d665dda3d1" />

---

## 9) Environment Setup & Dependencies

### Environment Variables
Create/update `.env`:
- `TEAM_SESSION_SECRET=...`
- `GEMINI_API_KEY=...`

MongoDB:
- Connection is implemented in `lib/db.js`.

### Install
```bash
npm install
npm install @google/genai
npm install chart.js react-chartjs-2
npm install recharts
