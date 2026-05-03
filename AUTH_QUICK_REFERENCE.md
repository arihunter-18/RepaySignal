# RepaySignal Authentication - Quick Reference

## 🚀 Quick Start (2 minutes)

### Windows
```bash
# In project root
setup.bat
```

### Linux/Mac
```bash
# In project root
chmod +x setup.sh
./setup.sh
```

## Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn backend.main:app --reload
```

## Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## Open in Browser
```
http://localhost:5173
```

## Demo Credentials
```
Email: admin@test.com
Password: demo123
```

---

## 🔐 Authentication Endpoints

### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "admin",
  "student_id": null  # required if role is "student"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "student_id": null
  }
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123",
  "role": "admin"  # client-side only
}

Response: Same as register
```

### Get Current User
```bash
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "student_id": null
}
```

### Logout
```bash
POST /auth/logout

Note: Token deletion handled client-side
```

---

## 🛡️ Protected Routes

### Admin Only
```
GET  /dashboard
GET  /alerts
GET  /student/:id
```

### Student Only
```
GET  /my-dashboard
```

### Get Current User Info (All Authenticated)
```
GET  /auth/me
```

---

## 📝 Frontend Components

### Auth Hook
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      {isAdmin && <p>You are an admin</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Protected Route
```typescript
// Already set up in App.tsx
<Route element={<ProtectedLayout allowedRole="admin" />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

---

## 🗄️ Database

### Check Users
```bash
# SQLite
sqlite3 repaysignal.db "SELECT id, name, email, role, is_active FROM users;"
```

### Add User Manually
```bash
python scripts/seed_users.py
```

---

## ⚙️ Configuration

### JWT Settings (backend/.env)
```env
JWT_SECRET=change-me-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440  # 24 hours
```

### Database
```env
DATABASE_URL=sqlite:///./repaysignal.db
# For production: postgresql://user:pass@host/db
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Email already registered" | User exists; use login or different email |
| "Invalid or expired token" | Token expired; login again |
| "Admin access required" | User doesn't have admin role |
| "student_id not found" | Run `python scripts/seed_demo.py` first |
| CORS error | Check backend CORS settings in main.py |
| 401 Unauthorized | Token missing or invalid; check auth header |

---

## 📊 Password Requirements

- ✅ Minimum 6 characters
- ✅ At least 1 letter
- ✅ At least 1 number
- ✅ Email must be valid format

---

## 🔄 Token Flow

```
1. User submits credentials
   ↓
2. Backend validates and hashes password
   ↓
3. Backend generates JWT with user data + role + expiry
   ↓
4. Frontend receives token and stores in localStorage
   ↓
5. Frontend includes token in Authorization header
   ↓
6. Backend validates JWT on each protected request
   ↓
7. If invalid/expired: return 401 → Frontend redirects to login
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `backend/models/auth.py` | User database model |
| `backend/services/auth_service.py` | Password hashing, JWT, user management |
| `backend/services/auth_dependency.py` | Route protection dependencies |
| `backend/services/validators.py` | Email/password validation |
| `backend/routers/auth.py` | API endpoints |
| `frontend/src/context/AuthContext.tsx` | Global auth state |
| `frontend/src/hooks/useAuth.ts` | Auth helper hook |
| `frontend/src/api/auth.ts` | API client calls |
| `frontend/src/pages/HomePage.tsx` | Login/Register UI |

---

## 🎯 Common Tasks

### Create Admin User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Create Student User
```bash
# First, get a student_id from database
sqlite3 repaysignal.db "SELECT student_id FROM students LIMIT 1;"

# Then create user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Name",
    "email": "student@example.com",
    "password": "student123",
    "role": "student",
    "student_id": "uuid-from-above"
  }'
```

### Test Protected Route
```bash
# Get token first (from login/register response)
TOKEN="eyJhbGc..."

# Use token
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📖 Full Documentation

See `AUTH_SETUP.md` and `AUTHENTICATION_COMPLETE.md` for detailed documentation.
