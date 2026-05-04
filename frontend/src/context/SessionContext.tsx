import { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'admin' | 'student';

// Hardcoded student session as per requirements
export const STUDENT_SESSION = {
  student_id: 'a0750f22-f898-58b9-8b89-fb5bf64c6dbe',
  institute_id: '1ba77ac2-d743-5e64-97f0-efec22d1a921',
  name: 'Arjun Mehta',
  course: 'MBA',
  course_family: 'campus',
  cgpa: 7.66,
  internship_count: 1,
  internship_employer_tier: 'unverified',
  ppo_exists: false,
  cert_count: 2,
  loan_emi_monthly: 22665.61,
  tenth_board_score: 78.4,
  twelfth_board_score: 69.9,
};

interface SessionContextValue {
  role: Role;
  setRole: (r: Role) => void;
  student: typeof STUDENT_SESSION;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  return (
    <SessionContext.Provider value={{ role, setRole, student: STUDENT_SESSION }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}