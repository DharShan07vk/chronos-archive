import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ApiRequestError, apiRequest } from "../api/api";
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

export interface CreateCapsuleInput {
  title: string;
  content: string;
  unlockAt: Date;
  shareEmail?: string;
  weather?: string;
  photos: MediaFile[];
  videos: MediaFile[];
  requireMedia?: boolean;
}

interface CapsuleContextType {
  capsules: Capsule[];
  loading: boolean;
  fetchCapsules: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<MediaFile[]>;
  addCapsule: (capsule: CreateCapsuleInput) => Promise<boolean>;
  getCapsule: (id: string) => Capsule | undefined;
  unlockCapsule: (id: string) => void;
}

const CapsuleContext = createContext<CapsuleContextType | null>(null);

const getCapsuleErrorMessage = (error: ApiRequestError, fallback: string): string => {
  if (error.code === "FILE_SIZE_LIMIT_EXCEEDED") {
    return error.message || "Video/photo must be 50MB or smaller.";
  }
  if (error.code === "MEDIA_REQUIRED") {
    return error.message || "Media upload failed. Please re-upload before creating capsule.";
  }
  if (error.code === "MEDIA_FILE_NOT_FOUND") {
    return error.message || "Some uploaded media files were not found on the server. Please re-upload.";
  }
  if (error.code === "INVALID_REQUEST_PAYLOAD") {
    return error.message || "Please check all required fields and try again.";
  }
  return error.message || fallback;
};

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
      const listResult = await apiRequest<any[] | { capsules?: any[] }>("/capsules/");
      const list = Array.isArray(listResult) ? listResult : listResult?.capsules ?? [];
      setCapsules(list.map(mapRaw));
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(error.message || "Failed to load capsules.");
      } else {
        toast.error("Network error. Could not load capsules.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const addCapsule = useCallback(async (data: CreateCapsuleInput): Promise<boolean> => {
    try {
      const created = mapRaw(
        await apiRequest<any>("/capsules/new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
      setCapsules((prev) => [created, ...prev]);
      return true;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(getCapsuleErrorMessage(error, "Failed to create capsule."));
      } else {
        toast.error("Network error. Could not create capsule.");
      }
      return false;
    }
  }, []);

  const uploadFiles = useCallback(async (files: File[]): Promise<MediaFile[]> => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      return await apiRequest<MediaFile[]>("/capsules/upload", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        toast.error(getCapsuleErrorMessage(error, "Failed to upload files."));
      } else {
        toast.error("Network error. Could not upload files.");
      }
      throw error;
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


