import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "dho" | "pharmacy" | "admin";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  jurisdiction: string;
  avatarInitials: string;
};

export const ROLE_PRESETS: Record<UserRole, UserProfile> = {
  dho: {
    id: "user-dho-01",
    name: "Dr. A. Senthilkumar",
    email: "dho@janswasthya.gov.in",
    role: "dho",
    roleTitle: "District Health Officer (DHO)",
    jurisdiction: "Thanjavur District",
    avatarInitials: "DS",
  },
  pharmacy: {
    id: "user-pharm-01",
    name: "Rajan Krishnamurthy",
    email: "srisai@pharmacy.tn.gov.in",
    role: "pharmacy",
    roleTitle: "Pharmacy Partner (PH-TN-2204)",
    jurisdiction: "Sri Sai Medicals, Thanjavur (613 001)",
    avatarInitials: "RK",
  },
  admin: {
    id: "user-admin-01",
    name: "Dr. Meenakshi Sundaram",
    email: "admin@health.tn.gov.in",
    role: "admin",
    roleTitle: "State Health Surveillance Director",
    jurisdiction: "Tamil Nadu Directorate of Public Health",
    avatarInitials: "MS",
  },
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "jan_swasthya_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    // Default fallback to DHO session for smooth direct access if previously logged in
    return ROLE_PRESETS.dho;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = (role: UserRole) => {
    const profile = ROLE_PRESETS[role];
    setUser(profile);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
