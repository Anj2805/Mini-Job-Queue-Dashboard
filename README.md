# Mini Job Queue Dashboard

A minimal, requirement-driven Job Queue Dashboard built using React.js and NestJS. This project demonstrates robust API design, state management, and real-world concurrency handling.

## Architecture

- **Frontend**: React + Vite + TypeScript. Native React state (`useState`/`useEffect`) is used to keep the application architecture as simple as possible. The `App.tsx` component acts as the smart container managing the global state, while `JobForm` and `JobTable` handle presentation.
- **Backend**: NestJS + TypeORM + PostgreSQL (`pg`). A minimalistic Controller -> Service -> Entity pattern is used.
- **Validation**: Strict boundary validation using `class-validator` at the controller level.

## Database Choice

**PostgreSQL** (hosted via Neon/Vercel) is used for persistence. It fully satisfies the assignment requirements while providing robust support for Serverless connection pooling and atomic transactions.

**Production Trade-off (`synchronize: true`)**:
For the purpose of this internship assignment, TypeORM is configured with `synchronize: true`. This automatically syncs the entity schema with the database. In a real production system, this is extremely dangerous as it can accidentally drop or alter tables. A true production system would disable this and use strictly managed database migrations.

## API Endpoints

- `POST /jobs` — Create a new job. (Requires `title`, `type`)
- `GET /jobs` — Get all jobs, ordered by creation date descending.
- `PATCH /jobs/:id/status` — Update job status.
- `DELETE /jobs/:id` — Delete a job.

## Validation & Status Transition Rules

The application enforces strict status transition rules:
- Allowed transitions: `pending` → `running` → `completed` OR `failed`.
- Invalid transitions (e.g., `completed` → `running`, `pending` → `completed`) are rejected by the backend.

The backend independently validates these rules in `JobsService`. It never relies on the React frontend for security or correctness. Bypassing the React app and calling the API directly will still result in appropriate `400 Bad Request` or `409 Conflict` errors.

## Concurrency Strategy

To handle race conditions (e.g., two tabs attempting to change a job from `pending` to `running` at the exact same time), the backend uses an **Atomic Conditional Update**.

Instead of complex distributed locking (like Redis), the transition strictly verifies the expected current state at the database level:

```sql
UPDATE jobs
SET status = 'running'
WHERE id = :id AND status = 'pending'
```

If the affected rows count is `0`, it means the state was changed concurrently (or the job doesn't exist). The API then returns a `409 Conflict`. The frontend catches this, gracefully alerts the user, and auto-refreshes to fetch the latest truthful state from the database.

## Bonus Feature: Database Index

A database index was added to the `status` column:

```typescript
@Index()
@Column({ type: 'varchar', default: 'pending' })
status: JobStatus;
```

**Why it matters**: The dashboard's core functionality heavily revolves around filtering jobs by status and counting the occurrences of each status. As the job table grows, an index ensures that `SELECT` operations filtering by status remain performant. It is a small, highly relevant production-ready improvement that introduces zero architectural overhead.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
The backend will run on `http://localhost:3000`. You must provide a valid PostgreSQL connection string via the `DATABASE_URL` environment variable.

**Environment Variables**:
- `FRONTEND_URL` (optional): Set this to the deployed frontend URL (e.g., `https://my-frontend.com`) to strictly configure CORS. Defaults to `http://localhost:5173`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

**Environment Variables**:
- `VITE_API_URL` (optional): Set this to the deployed backend URL when deploying. Defaults to `http://localhost:3000`.

## Assumptions & Trade-offs
- **Assumptions**: We assume jobs cannot be retried once they reach `completed` or `failed`. If retry functionality were required, the allowed transitions matrix would need an update.
- **Trade-offs**: TypeORM's `synchronize: true` is used for ease of setup. In a real production system, migrations would be strictly managed.
- **Future Improvements**: Pagination on the `GET /jobs` endpoint (e.g., `?page=1&limit=50`) would be necessary as the database grows to prevent performance degradation on the client side.
