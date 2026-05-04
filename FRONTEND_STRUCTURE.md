# RepaySignal Frontend Structure & Architecture

## Table of Contents
1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Core Technologies](#core-technologies)
4. [File-by-File Documentation](#file-by-file-documentation)
5. [Architecture Patterns](#architecture-patterns)
6. [Data Flow](#data-flow)
7. [Component Hierarchy](#component-hierarchy)

---

## Project Overview

**Frontend Framework**: React 19 with TypeScript
**Build Tool**: Vite 8
**Styling**: Tailwind CSS 4 + custom CSS
**State Management**: React Context + React Query (TanStack Query)
**Routing**: React Router v7
**HTTP Client**: Axios
**Charting**: Recharts

**Purpose**: Admin and Student dashboard for RepaySignal risk scoring platform
- **Admin View**: Portfolio analytics, student details, alerts management
- **Student View**: Personal risk assessment, recommendations, survival probabilities
- **Public View**: Landing page with authentication

---

## Directory Structure

```
frontend/
├── public/                     # Static assets (favicon, images)
│   └── [favicon.svg, etc]
│
├── src/
│   ├── api/                    # HTTP API client layer
│   │   ├── client.ts           # Axios configuration
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── students.ts         # Student listing & detail
│   │   ├── risk.ts             # Risk scoring endpoints
│   │   ├── portfolio.ts        # Portfolio aggregation
│   │   ├── interventions.ts    # Intervention recommendations
│   │   └── alerts.ts           # Alert management
│   │
│   ├── context/                # React Context providers
│   │   └── AuthContext.tsx     # Global authentication state
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Auth state access hook
│   │   ├── useStudents.ts      # Student data hooks (React Query)
│   │   ├── useRisk.ts          # Risk data hooks
│   │   └── useAlerts.ts        # Alert data hooks
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Auth types (User, AuthState)
│   │   ├── student.ts          # Student types
│   │   ├── risk.ts             # Risk score types
│   │   └── portfolio.ts        # Portfolio types
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── HomePage.tsx        # Public landing + login/register
│   │   ├── Dashboard.tsx       # Admin portfolio view
│   │   ├── StudentDetail.tsx   # Admin: single student detail
│   │   ├── StudentDashboard.tsx # Student: personal dashboard
│   │   └── AlertsPage.tsx      # Admin: alert management
│   │
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # Layout wrappers
│   │   │   ├── ProtectedLayout.tsx   # Auth check + route protection
│   │   │   ├── Sidebar.tsx           # Navigation menu
│   │   │   └── Topbar.tsx            # Page header
│   │   │
│   │   ├── shared/             # Generic components
│   │   │   ├── RiskBadge.tsx         # Risk tier badge (HIGH/MEDIUM/LOW)
│   │   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   │   └── ErrorMessage.tsx      # Error display
│   │   │
│   │   ├── portfolio/          # Admin portfolio components
│   │   │   ├── PortfolioHeatmap.tsx       # Risk heatmap by sector
│   │   │   ├── SectorExposureChart.tsx    # Sector breakdown chart
│   │   │   └── StressTestSlider.tsx       # Scenario analysis control
│   │   │
│   │   └── student/            # Student detail components
│   │       ├── SurvivalCurveChart.tsx    # p_3mo, p_6mo, p_12mo curve
│   │       ├── ShapDriverBars.tsx        # SHAP feature importance bars
│   │       └── InterventionPanel.tsx     # Intervention recommendations
│   │
│   ├── assets/                 # Images, fonts, icons
│   │   └── [static resources]
│   │
│   ├── App.tsx                 # Root app component (routing setup)
│   ├── App.css                 # App-level styles
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles & Tailwind
│
├── index.html                  # HTML entry point
├── package.json                # Dependencies & scripts
├── package-lock.json           # Dependency lock file
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # App-specific TS config
├── tsconfig.node.json          # Node TS config
├── vite.config.ts              # Vite bundler configuration
├── eslint.config.js            # ESLint linting rules
└── README.md                   # Frontend README
```

---

## Core Technologies

### React 19.2.5
- Latest stable React with hooks, context, and state management
- Server Components capabilities (not used in MVP)

### Vite 8
- Lightning-fast module bundler
- Hot Module Replacement (HMR) for instant dev feedback
- Optimized production builds

### TypeScript 6.0
- Full type safety
- Better IDE support and error catching

### Tailwind CSS 4
- Utility-first CSS framework
- Dark mode with custom color variables
- Responsive design system
- `@tailwindcss/vite` plugin for optimized builds

### React Router v7
- Client-side routing without page reloads
- Nested routes with layout management
- Route-level code splitting

### React Query (@tanstack/react-query) v5
- Server state management
- Automatic caching & refetch logic
- Request deduplication
- Background refetch on window focus

### Axios
- HTTP client with interceptors
- Automatic request/response transformation
- Built-in timeout & retry logic

### Recharts
- React charting library
- Used for: heatmaps, sector exposure, survival curves, SHAP drivers

---

## File-by-File Documentation

### API Layer (`src/api/`)

#### `client.ts`
**Purpose**: Axios HTTP client configuration

**Contents**:
```typescript
const client = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});
```

**Usage**: Base for all API calls, configured with backend URL and headers
**No interceptors** (bypass auth mode)

---

#### `auth.ts`
**Purpose**: Authentication API layer (currently bypassed)

**Exports**:
```typescript
export const authApi = {
  login: async (email, password, name, role) => {...},    // POST /auth/login
  logout: async () => {...},                               // POST /auth/logout
  me: async () => {...},                                   // GET /auth/me
};
```

**Status**: Dummy implementation (returns bypass token)

---

#### `students.ts`
**Purpose**: Student data API layer

**Exports**:
```typescript
export const studentsApi = {
  list: (params?: { course_family?, risk_tier?, limit? }) => {},        // GET /students
  getById: (id: string) => {},                                           // GET /students/{id}
  getMyProfile: () => {},                                                // GET /students/me
};
```

**Response Types**: StudentListItem, StudentDetail (from types/student.ts)

---

#### `risk.ts`
**Purpose**: Risk scoring API layer

**Exports**:
```typescript
export const riskApi = {
  getByStudentId: (studentId: string) => {},     // GET /risk/{studentId} (real-time ML)
  getCached: (studentId: string) => {},          // GET /risk/{studentId}/cached (cached)
  getRiskCard: (studentId: string) => {},        // POST /risk/card (LLM narrative)
};
```

**Response Types**: RiskScore (with SHAP drivers, survival probs, stress index)

---

#### `portfolio.ts`
**Purpose**: Portfolio aggregation & stress testing

**Exports**:
```typescript
export const portfolioApi = {
  getSummary: () => {},                              // GET /portfolio
  stressTest: (field: string, shock_pct: number) => {}  // POST /stress-test
};
```

**Response Types**: PortfolioSummary (stats, sector_exposure, alerts, model_version)

---

#### `interventions.ts`
**Purpose**: Intervention recommendations API

**Exports**:
```typescript
export const interventionsApi = {
  getByStudentId: (studentId: string) => {}  // GET /interventions/{studentId}
};
```

**Response**: List of top-3 interventions with lift estimates and implementation cost

---

#### `alerts.ts`
**Purpose**: Alert management API

**Exports**:
```typescript
export const alertsApi = {
  list: (state: string, limit: number) => {},        // GET /alerts?state=triggered&limit=20
  markActioned: (alertId: string, action_taken: string) => {}  // PATCH /alerts/{alertId}
};
```

**Response Types**: AlertListItem (with student name, deadline, severity)

---

### Context Layer (`src/context/`)

#### `AuthContext.tsx`
**Purpose**: Global authentication state management

**Key State**:
```typescript
interface AuthState {
  user: User | null;           // { id, name, email, role, student_id? }
  token: string | null;         // JWT token (or "bypass")
  isAuthenticated: boolean;     // Auth status
  isLoading: boolean;           // Loading during restore
}
```

**Key Functions**:
- `login(payload)`: Creates user, stores to localStorage, updates state
- `logout()`: Clears storage, resets state
- `useAuthContext()`: Access context values

**Session Persistence**: Restores user from `localStorage['rs_user']` on app load

---

### Hook Layer (`src/hooks/`)

#### `useAuth.ts`
**Purpose**: Wrapper around AuthContext with computed properties

**Exports**:
```typescript
export function useAuth() {
  const auth = useAuthContext();
  return {
    ...auth,
    isAdmin: auth.user?.role === 'admin',
    isStudent: auth.user?.role === 'student',
    studentId: auth.user?.student_id ?? null,
  };
}
```

**Usage**: `const { user, isAdmin, login, logout } = useAuth();`

---

#### `useStudents.ts`
**Purpose**: React Query hooks for student data fetching

**Exports**:
```typescript
useStudentList(filters?) => useQuery
  // Fetches list with optional filters, 30s cache
  
useStudentDetail(id) => useQuery
  // Fetches single student, enabled when id exists
  
useMyProfile() => useQuery
  // Fetches current user's student profile
```

**Caching**: 30 seconds (staleTime=30_000)

---

#### `useRisk.ts`
**Purpose**: React Query hooks for risk scoring

**Exports**:
```typescript
useRiskScore(studentId) => useQuery
  // Real-time ML scoring, 60s cache
  
useCachedRiskScore(studentId) => useQuery
  // Cached scoring (faster), 120s cache
  
useRiskCard(studentId) => useQuery
  // LLM narrative generation, 5min cache
```

---

#### `useAlerts.ts`
**Purpose**: React Query hooks for alert management

**Exports**:
```typescript
useAlerts(state?) => useQuery
  // List alerts, auto-refetch every 30s if state="triggered"
  
useMarkActioned() => useMutation
  // Mark alert as actioned, invalidates alert & portfolio cache
```

---

### Types (`src/types/`)

#### `auth.ts`
**Defines**:
- `User`: { id, name, email, role, student_id? }
- `AuthState`: { user, token, isAuthenticated, isLoading }
- `LoginPayload`: { name, email, password, role }

---

#### `student.ts`
**Defines**:
- `StudentListItem`: { student_id, name, course_type, risk_score, risk_tier, ... }
- `StudentDetail`: Full profile with institute_tier, data_trust_score

---

#### `risk.ts`
**Defines**:
- `RiskScore`: { risk_score, ci_lower, ci_upper, p_3mo, p_6mo, p_12mo, shap_drivers, bias_flags, ... }

---

#### `portfolio.ts`
**Defines**:
- `PortfolioSummary`: { total_students, high_risk_count, sector_exposure, recent_alerts, model_version }
- `SectorExposure`: { field, student_count, avg_risk, demand_percentile }

---

### Pages (`src/pages/`)

#### `HomePage.tsx`
**Purpose**: Public landing page + login/register form

**Features**:
- Hero section with product features
- Auth form (login/register toggle)
- Role selector (admin/student)
- Bypass authentication (accepts any credentials)
- Responsive design for mobile & desktop

**No Auth Required**: Public route

---

#### `Dashboard.tsx`
**Purpose**: Admin portfolio management dashboard

**Sections**:
1. **Stats Row**: Total borrowers, high-risk count, active alerts, avg risk score
2. **Heatmap**: 2D grid showing students grouped by field/risk_tier
3. **Sector Exposure**: Bar chart of avg_risk by field
4. **Stress Test**: Slider to simulate demand shocks
5. **Model Status**: Version info, retraining date, R²

**Data Fetched**:
- `GET /portfolio` (auto-refresh every 30s)
- `GET /students?limit=100`

**Auth**: Admin only

---

#### `StudentDetail.tsx`
**Purpose**: Admin view of single student's full risk profile

**Sections**:
1. **Identity Card**: Name, institute, course, placement status
2. **Risk Card**: Risk score + confidence intervals + stress index
3. **Survival Chart**: p_3mo, p_6mo, p_12mo probabilities over time
4. **SHAP Drivers**: Bar chart of top 5 feature impacts
5. **Interventions**: Top 3 recommendations with lift estimates
6. **Related Alerts**: Triggered alerts for this student

**Data Fetched**:
- `GET /students/{id}`
- `GET /risk/{id}` (real-time ML)
- `POST /risk/card` (LLM narrative)
- `GET /interventions/{id}`
- `GET /alerts?state=triggered`

**Auth**: Admin only

---

#### `StudentDashboard.tsx`
**Purpose**: Student view of personal risk assessment

**Sections** (similar to StudentDetail):
1. **Risk Score**: Own default probability
2. **Survival Outlook**: Enrollment survival curve
3. **Stress Index**: Repayment burden indicator
4. **Personalized Recommendations**: Top interventions for student
5. **Risk Card**: Generated narrative explanation

**Data Fetched**:
- `GET /risk/{student_id}`
- `POST /risk/card`
- `GET /interventions/{student_id}`

**Auth**: Student only

---

#### `AlertsPage.tsx`
**Purpose**: Admin alert case management

**Features**:
1. **State Filter**: Toggle between "triggered" and "actioned"
2. **Alert Table**: List of alerts with student name, trigger, deadline, severity
3. **Action Form**: Text input to record action taken
4. **Deadline Highlight**: Red for overdue, yellow for upcoming

**Data Fetched**:
- `GET /alerts?state=triggered` (refetch every 30s)
- `PATCH /alerts/{id}` (on action)

**Auth**: Admin only

---

### Components (`src/components/`)

#### Layout Components (`components/layout/`)

##### `ProtectedLayout.tsx`
**Purpose**: Route wrapper for authentication & authorization

**Features**:
- Checks isAuthenticated (redirects to / if not)
- Checks allowedRole (redirects to correct dashboard if wrong role)
- Shows loading spinner during auth check
- Renders Sidebar + Outlet (child routes)

**Props**: `{ allowedRole?: "admin" | "student" }`

---

##### `Sidebar.tsx`
**Purpose**: Left navigation menu

**Contents**:
- Logo
- Admin Links: Portfolio, Alerts, Students
- Student Links: My Risk Card
- User info & logout button

**State**: useAuth() for user info

---

##### `Topbar.tsx`
**Purpose**: Page header with title & subtitle

**Props**: `{ title: string; subtitle: string }`

---

#### Shared Components (`components/shared/`)

##### `RiskBadge.tsx`
**Purpose**: Risk tier visual indicator

**Props**: `{ tier: "HIGH" | "MEDIUM" | "LOW"; score: number }`

**Styling**:
- HIGH: Red background + icon
- MEDIUM: Yellow background + icon
- LOW: Green background + icon

---

##### `LoadingSpinner.tsx`
**Purpose**: Animated loading indicator

**Props**: `{ label?: string }`

---

##### `ErrorMessage.tsx`
**Purpose**: Error display card

**Props**: `{ message: string; onRetry?: () => void }`

---

#### Portfolio Components (`components/portfolio/`)

##### `PortfolioHeatmap.tsx`
**Purpose**: 2D grid visualization of students by sector & risk tier

**Data**: StudentListItem[]

**Visualization**: Recharts with bubbles sized by count

---

##### `SectorExposureChart.tsx`
**Purpose**: Bar chart of avg risk by sector

**Data**: SectorExposure[]

**Visualization**: Recharts BarChart

---

##### `StressTestSlider.tsx`
**Purpose**: Interactive scenario analysis control

**Features**:
- Dropdown to select field
- Slider for shock percentage (-50% to +50%)
- Real-time result display
- Calls `portfolioApi.stressTest()`

---

#### Student Components (`components/student/`)

##### `SurvivalCurveChart.tsx`
**Purpose**: Line chart showing p_3mo, p_6mo, p_12mo survival probabilities

**Data**: RiskScore

**Visualization**: Recharts LineChart

---

##### `ShapDriverBars.tsx`
**Purpose**: Horizontal bar chart of SHAP feature importance

**Data**: RiskScore.shap_drivers

**Visualization**: Recharts BarChart

---

##### `InterventionPanel.tsx`
**Purpose**: Display top-3 interventions with details

**Data**: Intervention[]

**Features**:
- Intervention name & description
- Predicted lift estimate
- Implementation time & cost
- Call-to-action button

---

### Root Components

#### `App.tsx`
**Purpose**: Main app component with routing setup

**Structure**:
- QueryClientProvider (React Query)
- AuthProvider (Context)
- BrowserRouter (React Router)
- Routes definition

**Routes**:
```typescript
/ → HomePage (public)
/dashboard → Dashboard (admin only)
/student/:id → StudentDetail (admin only)
/alerts → AlertsPage (admin only)
/my-dashboard → StudentDashboard (student only)
```

---

#### `App.css`
**Purpose**: App-level styles for animations & theme

**Contains**: Fade-up animations, gradient definitions, custom styles

---

#### `main.tsx`
**Purpose**: React entry point

**Contents**: ReactDOM.createRoot() with App component

---

#### `index.css`
**Purpose**: Global styles & Tailwind CSS

**Imports**:
- Google Fonts (Syne, DM Sans, JetBrains Mono)
- Tailwind CSS utilities
- Custom CSS variables (--purple, --teal, --bg-dark, etc.)
- Custom scrollbar styling

---

### Configuration Files

#### `package.json`
**Purpose**: Dependencies & npm scripts

**Scripts**:
- `npm run dev` → Start Vite dev server (http://localhost:5173)
- `npm run build` → Production build
- `npm run lint` → ESLint check
- `npm run preview` → Preview production build locally

**Key Dependencies**:
- react, react-dom
- react-router-dom (routing)
- @tanstack/react-query (state)
- axios (HTTP)
- tailwindcss (styling)
- recharts (charting)
- typescript (types)
- vite (bundler)

---

#### `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**Settings**:
- target: ES2020
- module: ESNext
- strict: true (strict type checking)
- lib: ["ES2020", "DOM", "DOM.Iterable"]

---

#### `vite.config.ts`
**Purpose**: Vite bundler configuration

**Plugins**:
- @vitejs/plugin-react (React JSX transform)
- @tailwindcss/vite (Tailwind CSS)

---

#### `eslint.config.js`
**Purpose**: Linting rules for code quality

**Extends**:
- typescript-eslint
- react-hooks
- react-refresh

---

#### `index.html`
**Purpose**: HTML entry point

**Contents**:
```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>RepaySignal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Architecture Patterns

### 1. API Layer Pattern
```
Components
    ↓
Hooks (useStudents, useRisk, etc.)
    ↓
React Query (caching & refetching)
    ↓
API Layer (studentsApi, riskApi, etc.)
    ↓
HTTP Client (axios)
    ↓
Backend (http://localhost:8000)
```

### 2. State Management
- **Global Auth**: React Context (AuthContext.tsx)
- **Server State**: React Query (useStudents, useRisk, useAlerts)
- **UI State**: Component useState (filters, form inputs, etc.)
- **Session**: localStorage (persist user between page reloads)

### 3. Routing Structure
```
App.tsx (root)
  ├── HomePage (public)
  ├── ProtectedLayout (admin)
  │   ├── Dashboard
  │   ├── StudentDetail
  │   └── AlertsPage
  └── ProtectedLayout (student)
      └── StudentDashboard
```

### 4. Component Hierarchy
```
App
  └── Router
      └── Routes
          ├── HomePage
          └── ProtectedLayout
              ├── Sidebar
              └── Page Component
                  ├── Topbar
                  ├── Shared Components (RiskBadge, LoadingSpinner)
                  └── Feature Components (PortfolioHeatmap, etc.)
```

---

## Data Flow

### Authentication Flow
```
HomePage.tsx
    ↓ [user submits login form]
    ↓
AuthContext.login()
    ↓ [stores user to localStorage]
    ↓
setState({ user, token, isAuthenticated: true })
    ↓
useAuth() hook notified
    ↓
ProtectedLayout checks allowedRole
    ↓
Routes to Dashboard (admin) or StudentDashboard (student)
```

### Data Fetching Flow
```
Dashboard.tsx mounts
    ↓
useQuery hooks execute (useStudentList, usePortfolioSummary)
    ↓
React Query calls API functions
    ↓ (portfolioApi.getSummary, studentsApi.list)
    ↓
HTTP client (axios) sends requests
    ↓
Backend responds with data
    ↓
React Query caches results (30-60 seconds)
    ↓
Components re-render with data
    ↓
Background refetch on interval or window focus
```

### Component Rendering Flow
```
Dashboard
    ↓
Renders StatCard (portfolio metrics)
    ↓
Renders PortfolioHeatmap (from students list)
    ↓
Renders SectorExposureChart (from portfolio summary)
    ↓
Renders StressTestSlider (interactive)
    ↓
If loading → LoadingSpinner
    ↓
If error → ErrorMessage
```

---

## Component Hierarchy Diagram

```
<App>
  <QueryClientProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route element={<ProtectedLayout allowedRole="admin" />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <StatCard />
              <PortfolioHeatmap />
              <SectorExposureChart />
              <StressTestSlider />
            </Route>
            
            <Route path="/student/:id" element={<StudentDetail />}>
              <Topbar />
              <Sidebar />
              <RiskBadge />
              <SurvivalCurveChart />
              <ShapDriverBars />
              <InterventionPanel />
            </Route>
            
            <Route path="/alerts" element={<AlertsPage />}>
              <Topbar />
              <Sidebar />
            </Route>
          </Route>
          
          <Route element={<ProtectedLayout allowedRole="student" />}>
            <Route path="/my-dashboard" element={<StudentDashboard />}>
              <Topbar />
              <Sidebar />
              <RiskBadge />
              <SurvivalCurveChart />
              <ShapDriverBars />
              <InterventionPanel />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
</App>
```

---

## Key Implementation Details

### Styling Approach
- **Utility-first**: Tailwind CSS classes directly in JSX
- **Dark Mode**: Custom CSS variables (--bg-dark: #0F0F13)
- **Responsive**: md: breakpoint for mobile/desktop
- **Colors**: Purple (#7C5CFC), Teal (#0EA5A0), Slate (grays)

### Error Handling
- **API Errors**: useQuery retry logic (automatic 1 retry)
- **Render Errors**: ErrorMessage component for user display
- **Auth Errors**: Redirect to home on 401

### Performance Optimization
- **React Query Caching**: 30-120s staleTime per endpoint
- **Code Splitting**: Route-level lazy loading (Vite)
- **Memoization**: useCallback/useMemo for expensive operations

### Session Management
- **localStorage Persistence**: `rs_user` key stores user data
- **Auto-restore**: AuthContext checks localStorage on app load
- **Token Storage**: `localStorage['rs_token']` (currently "bypass")

---

## Frontend-to-Backend API Calls Summary

| Page | Component | API Call | Purpose |
|---|---|---|---|
| Dashboard | StatCard row | `GET /portfolio` | Fetch portfolio stats |
| Dashboard | PortfolioHeatmap | `GET /students?limit=100` | Student list |
| Dashboard | StressTestSlider | `POST /stress-test` | Scenario analysis |
| StudentDetail | - | `GET /students/{id}` | Student profile |
| StudentDetail | - | `GET /risk/{id}` | Real-time risk (ML) |
| StudentDetail | - | `POST /risk/card` | LLM narrative |
| StudentDetail | - | `GET /interventions/{id}` | Recommendations |
| AlertsPage | Alert List | `GET /alerts?state=triggered` | Active alerts |
| AlertsPage | Action Form | `PATCH /alerts/{id}` | Mark actioned |
| StudentDashboard | - | `GET /risk/{id}` | Own risk score |
| StudentDashboard | - | `POST /risk/card` | Own narrative |
| StudentDashboard | - | `GET /interventions/{id}` | Own recommendations |

---

## Development Workflow

### Starting Development
```bash
cd frontend
npm run dev
```
This starts Vite dev server with HMR at http://localhost:5173

### Building for Production
```bash
npm run build
```
Creates optimized bundle in `dist/` directory

### Type Checking
```bash
npm run lint
```
Runs ESLint + TypeScript checks

### Troubleshooting

**Issue**: Port 5173 already in use
```bash
npm run dev -- --port 3000
```

**Issue**: Stale cache
```bash
rm -rf node_modules dist && npm install
```

**Issue**: Backend not accessible
Check: Backend running on http://localhost:8000 with CORS enabled

