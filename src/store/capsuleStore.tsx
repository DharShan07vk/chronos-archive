import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authFetch } from "../api/api";
import { toast } from "sonner";

export interface MediaFile {
  name: string;
  type: string;
  url: string;
}

export interface Capsule {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  unlockAt: Date;
  shareEmail?: string;
  weather?: string;
  isLocked: boolean;
  photos: MediaFile[];
  videos: MediaFile[];
}

interface CapsuleContextType {
  capsules: Capsule[];
  loading: boolean;
  fetchCapsules: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<MediaFile[]>;
  addCapsule: (capsule: Omit<Capsule, "id" | "createdAt" | "isLocked">) => Promise<boolean>;
  getCapsule: (id: string) => Capsule | undefined;
  unlockCapsule: (id: string) => void;
}

const CapsuleContext = createContext<CapsuleContextType | null>(null);

const mapRaw = (raw: any): Capsule => {
  console.log("[capsule] raw item from backend:", raw); // remove once field names confirmed
  return {
    ...raw,
    // handle both MongoDB _id and numeric/string id
    id: String(raw.id ?? raw._id ?? raw.capsuleId ?? ""),
    // handle camelCase and snake_case date fields
    createdAt: new Date(raw.createdAt ?? raw.created_at),
    unlockAt:  new Date(raw.unlockAt  ?? raw.unlock_at  ?? raw.openAt ?? raw.open_at),
    isLocked: raw.isLocked ?? raw.is_locked ?? new Date(raw.unlockAt ?? raw.unlock_at ?? raw.openAt) > new Date(),
    photos: raw.photos ?? [],
    videos: raw.videos ?? [],
  };
};

export const CapsuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCapsules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/capsules/");
      if (res.ok) {
        const body = await res.json();
        console.log("[capsule] fetchCapsules raw response:", body); // remove once confirmed
        // handle bare array OR { data: [...] } OR { capsules: [...] } wrapper
        const list: any[] = Array.isArray(body)
          ? body
          : (body?.data ?? body?.capsules ?? []);
        setCapsules(list.map(mapRaw));
      } else {
        toast.error("Failed to load capsules.");
      }
    } catch {
      toast.error("Network error. Could not load capsules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const addCapsule = useCallback(async (data: Omit<Capsule, "id" | "createdAt" | "isLocked">): Promise<boolean> => {
    try {
      const res = await authFetch("/capsules/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = mapRaw(await res.json());
        setCapsules((prev) => [created, ...prev]);
        return true;
      } else {
        toast.error("Failed to create capsule.");
        return false;
      }
    } catch {
      toast.error("Network error. Could not create capsule.");
      return false;
    }
  }, []);

  const uploadFiles = useCallback(async (files: File[]): Promise<MediaFile[]> => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const res = await authFetch("/capsules/upload", {
        method: "POST",
        body: formData,
       
      });
      if (res.ok) {
        return await res.json(); 
      }
      toast.error("Failed to upload files.");
      return [];
    } catch {
      toast.error("Network error. Could not upload files.");
      return [];
    }
  }, []);

  const getCapsule = useCallback(
    (id: string) => capsules.find((c) => String(c.id) === String(id)),
    [capsules]
  );

  const unlockCapsule = useCallback((id: string) => {
    setCapsules((prev) => prev.map((c) => (c.id === id ? { ...c, isLocked: false } : c)));
  }, []);

  return (
    <CapsuleContext.Provider value={{ capsules, loading, fetchCapsules, uploadFiles, addCapsule, getCapsule, unlockCapsule }}>
      {children}
    </CapsuleContext.Provider>
  );
};

export const useCapsules = () => {
  const ctx = useContext(CapsuleContext);
  if (!ctx) throw new Error("useCapsules must be used within CapsuleProvider");
  return ctx;
};


