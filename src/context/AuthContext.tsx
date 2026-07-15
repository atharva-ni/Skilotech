'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { User, UserRole, Payment } from '@/data/mock';

interface DbPayment {
  id: string;
  metadata?: {
    courseTitle?: string;
  };
  amount: number;
  status: string;
  paidAt?: string;
  createdAt: string;
  method?: string;
  razorpayOrderId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  enrolledCourseIds: string[];
  payments: Payment[];
  refreshProfile: () => Promise<void>;
  enrollInCourse: (courseId: string) => void;
  addPayment: (payment: Payment) => void;
  // Deprecated mock methods kept for backward compatibility:
  login: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  enrolledCourseIds: [],
  payments: [],
  refreshProfile: async () => {},
  enrollInCourse: () => {},
  addPayment: () => {},
  login: () => {},
  logout: () => {},
  setRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();
  
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setEnrolledCourseIds(data.enrolledCourseIds || []);
        
        // Map DB payments into mock Payment types
        const mappedPayments: Payment[] = (data.payments || []).map((p: DbPayment) => ({
          id: p.id,
          studentName: data.user.name,
          courseName: p.metadata?.courseTitle || 'Course Purchase',
          amount: p.amount, // already in ₹
          status: p.status === 'completed' ? 'completed' : p.status === 'failed' ? 'failed' : 'pending',
          date: p.paidAt ? p.paidAt.slice(0, 10) : p.createdAt.slice(0, 10),
          method: p.method || 'UPI',
          invoiceId: p.razorpayOrderId || 'INV-' + p.id.substring(0, 8).toUpperCase(),
        }));
        setPayments(mappedPayments);
      } else {
        setDbUser(null);
        setEnrolledCourseIds([]);
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch database user whenever Clerk login state changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        Promise.resolve().then(() => {
          fetchProfile();
        });
      } else {
        Promise.resolve().then(() => {
          setDbUser(null);
          setEnrolledCourseIds([]);
          setPayments([]);
          setIsLoading(false);
        });
      }
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  const enrollInCourse = useCallback((courseId: string) => {
    setEnrolledCourseIds((prev) => {
      if (prev.includes(courseId)) return prev;
      return [...prev, courseId];
    });
  }, []);

  const addPayment = useCallback((payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
  }, []);

  // Keep compatibility for mock methods (instruct dashboard users to use Clerk instead)
  const login = useCallback(() => {
    console.warn('login() is deprecated. Please sign in via Clerk.');
  }, []);

  const logout = useCallback(() => {
    signOut();
  }, [signOut]);

  const setRole = useCallback(() => {
    console.warn('setRole() is deprecated. Roles are managed in the database.');
  }, []);

  return (
    <AuthContext.Provider value={{
      user: dbUser,
      isAuthenticated: !!dbUser,
      isLoading: isLoading || !isLoaded,
      enrolledCourseIds,
      payments,
      refreshProfile: fetchProfile,
      enrollInCourse,
      addPayment,
      login,
      logout,
      setRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
