import React, { createContext, useContext, useState, useCallback } from "react";

export interface Capsule {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  unlockAt: Date;
  shareEmail?: string;
  weather?: string;
  isLocked: boolean;
}

interface CapsuleContextType {
  capsules: Capsule[];
  addCapsule: (capsule: Omit<Capsule, "id" | "createdAt" | "isLocked">) => void;
  getCapsule: (id: string) => Capsule | undefined;
  unlockCapsule: (id: string) => void;
}

const CapsuleContext = createContext<CapsuleContextType | null>(null);

const MOCK_CAPSULES: Capsule[] = [
  {
    id: "CP-2026-001",
    title: "Letter to Future Me",
    content: "Dear future self, I hope you've learned to stop procrastinating. Remember that time you stayed up until 3am building a time capsule app? That was tonight. I hope it was worth it. The coffee was strong and the code was clean.",
    createdAt: new Date("2026-01-15"),
    unlockAt: new Date("2027-01-15"),
    weather: "Cloudy, 12°C",
    isLocked: true,
  },
  {
    id: "CP-2026-002",
    title: "Project Launch Notes",
    content: "We shipped v1.0 today. The team was incredible. Remember this feeling of accomplishment when things get hard.",
    createdAt: new Date("2026-02-01"),
    unlockAt: new Date("2026-02-10"),
    weather: "Sunny, 8°C",
    isLocked: false,
  },
  {
    id: "CP-2026-003",
    title: "Summer Goals 2026",
    content: "1. Learn to surf. 2. Read 12 books. 3. Visit Tokyo. 4. Build something meaningful.",
    createdAt: new Date("2026-02-10"),
    unlockAt: new Date("2026-09-01"),
    weather: "Rainy, 6°C",
    isLocked: true,
  },
  {
    id: "CP-2026-004",
    title: "Gratitude Archive",
    content: "Today I'm grateful for: morning coffee, good music, the sound of rain, and the people who believe in me.",
    createdAt: new Date("2026-02-14"),
    unlockAt: new Date("2026-02-14"),
    shareEmail: "friend@example.com",
    weather: "Overcast, 10°C",
    isLocked: false,
  },
];

let counter = 5;

export const CapsuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capsules, setCapsules] = useState<Capsule[]>(MOCK_CAPSULES);

  const addCapsule = useCallback((data: Omit<Capsule, "id" | "createdAt" | "isLocked">) => {
    const id = `CP-2026-${String(counter++).padStart(3, "0")}`;
    const newCapsule: Capsule = {
      ...data,
      id,
      createdAt: new Date(),
      isLocked: data.unlockAt > new Date(),
    };
    setCapsules((prev) => [newCapsule, ...prev]);
  }, []);

  const getCapsule = useCallback((id: string) => capsules.find((c) => c.id === id), [capsules]);

  const unlockCapsule = useCallback((id: string) => {
    setCapsules((prev) => prev.map((c) => (c.id === id ? { ...c, isLocked: false } : c)));
  }, []);

  return (
    <CapsuleContext.Provider value={{ capsules, addCapsule, getCapsule, unlockCapsule }}>
      {children}
    </CapsuleContext.Provider>
  );
};

export const useCapsules = () => {
  const ctx = useContext(CapsuleContext);
  if (!ctx) throw new Error("useCapsules must be used within CapsuleProvider");
  return ctx;
};
