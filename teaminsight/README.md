# TeamInsight – README

## Contents
1. Project Structure  
2. Database Entities  
3. Database Entity Relationships  
4. Constraints  
5. Backend (API & Infrastructure)  
6. Data Flow (Backend to Frontend)  
7. Roadmap  

---

## 1. Project Structure

### Frontend (UI & Pages)
- `app/`

### Backend (API Routes – Next.js App Router)
- `app/api/`

### Backend (Infrastructure & Data Access)
- `lib/` – database connection
- `models/` – Mongoose schemas

### Database
- MongoDB (local instance) accessed via Mongoose

---

## 2. Database Entities

### Lecturer
**Description:** Represents the system administrator (lecturer) for authentication and receiving alerts.
- `_id`
- `email`
- `passwordHash`
- `createdAt`

### Team
**Description:** Represents a single project team. All system interactions are performed at the team level.
- `_id`
- `teamId`
- `projectName`
- `accessCode`
- `contactEmail`
- `members: [{ memberId, displayName }]`
- `status`
- `createdAt`

### Reflection
**Description:** Represents a personal feedback submission by a team member as part of a reflection session. Stored for history and analysis.
- `_id`
- `teamId`
- `memberId`
- `answers (5)`
- `freeText`
- `createdAt`

### Alert
**Description:** Represents an abnormal system event and maintains alert history and email notification tracking.
- `_id`
- `teamId`
- `severity`
- `message`
- `emailTo`
- `emailStatus`
- `createdAt`

### Announcement
**Description:** Used to publish announcements or tasks from the lecturer to the teams.
- `_id`
- `title`
- `body`
- `targetTeams`
- `createdAt`

---

## 3. Database Entity Relationships

- **Team → Reflection** (One-to-Many)  
  A single team can have multiple reflections.  
  Each reflection belongs to exactly one team (`teamId`).

- **Team → Alert** (One-to-Many)  
  Each team can have a history of alerts.

- **Announcement → Team** (One-to-Many / Broadcast)  
  An announcement can target all teams (`"all"`) or a specific list of `teamId`s.

- **Lecturer → Alert** (Logical One-to-Many)  
  All alerts are sent to the single lecturer in the system.

---

## 4. Constraints

- `Team.teamId` must be unique.
- `memberId` must be unique within a specific team.
- Only one reflection is allowed per `teamId + memberId` within a defined time period (application-level rule).
- The system contains a single lecturer.

---

## 5. Backend (API & Infrastructure)

### Backend Overview
The backend is implemented using the Next.js App Router.  
Next.js is used to handle both frontend and backend logic within the same project, as taught in the course.

The backend is responsible for:
- Connecting to MongoDB
- Handling business logic
- Exposing API endpoints for the frontend

### Backend Structure

#### API Layer
Path: `app/api/`  
Each folder represents an API endpoint and contains a `route.js` file.

### Implemented API Routes

#### 1. Authentication
- **POST `/api/lecturer/login`**  
  Authenticates the lecturer using email and password.

#### 2. Team
- **POST `/api/team/join`**  
  Allows a team to join the system using `teamId` and `accessCode`.

- **GET `/api/teams`**  
  Returns a list of all teams (lecturer view).

- **GET `/api/teams/[teamId]`**  
  Returns full details of a specific team.  
  (`[teamId]` is a dynamic route parameter)

- **PUT `/api/teams/[teamId]`**  
  Updates team data (project info, members, status).  
  Automatically creates an alert if the team status changes to an abnormal state (`yellow` / `red`).

#### 3. Reflections
- **POST `/api/reflections`**  
  Submits a reflection from a team member.  
  Enforces a constraint of one reflection per member per team within a defined time period.

- **GET `/api/teams/[teamId]/reflections`**  
  Returns all reflections submitted by a specific team.

#### 4. Alerts
- **POST `/api/alerts`**  
  Creates a manual alert related to a team.

- **GET `/api/teams/[teamId]/alerts`**  
  Returns all alerts associated with a specific team.

#### 5. Announcements
- **POST `/api/announcements`**  
  Creates an announcement from the lecturer to all teams or selected teams.

- **GET `/api/announcements`**  
  Returns all announcements.

#### 6. Analytics
- **GET `/api/analytics/teams`**  
  Returns aggregated analytics per team (status, reflection averages).

- **GET `/api/analytics/compare`**  
  Compares analytics data between multiple teams (requires at least two `teamId`s).

### API Behavior (Common to All Routes)
Each API route:
1. Receives an HTTP request (GET / POST / PUT)
2. Validates input data
3. Uses the relevant Mongoose models
4. Communicates with MongoDB via Mongoose
5. Returns a structured JSON response

---

## 6. Data Flow

### How the system works
1. The frontend sends an HTTP request to an API endpoint (GET / POST / PUT).
2. The matching API route in `app/api/.../route.js` is executed.
3. The route uses the relevant Mongoose model to apply business logic.
4. Mongoose reads/writes data in MongoDB.
5. A JSON response is returned to the frontend.

**In general:**  
Frontend → Backend → Database → Backend → Frontend

**In this project:**  
Frontend → Next.js API Route → Mongoose → MongoDB → API Response → Frontend

---

## 7. Roadmap (According to the Course)

### 1️⃣ Logic & Design
- Entity definitions (Lecturer, Team, etc.)
- Relationships and constraints  
**Status:** ✅ Completed

### 2️⃣ Database (MongoDB)
- Database and collections creation
- Test data insertion  
**Status:** ✅ Completed

### 3️⃣ Project Setup (Next.js)
- Repository setup
- Next.js project initialization  
**Status:** ✅ Completed

### 4️⃣ Backend Infrastructure
- MongoDB connection with Mongoose
- Schema definitions  
**Status:** ✅ Completed

### 5️⃣ API Routes
- Lecturer login
- Team join
- Reflection submission
- Alerts and announcements  
**Status:** ✅ Completed

### 6️⃣ Frontend (React / App Router)
- Pages
- Forms
- Dashboard  
**Status:** ⏭️ In Progress

### 7️⃣ Polishing & Submission
- Validation
- UX improvements
- Final README  
**Status:** ⏭️ Pending
