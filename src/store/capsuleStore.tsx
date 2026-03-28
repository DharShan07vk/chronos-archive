import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { ApiRequestError, apiRequest } from "../api/api";
import { toast } from "sonner";
import { useAuth } from "./authStore";

export interface MediaFile {
  name: string;
  type: string;
  url: string;
}

export interface Recipient {
  email: string;
  canReshare: boolean;
}

export interface Capsule {
  id: string;
  title: string;
  content: string | null;
  createdAt: Date;
  unlockAt: Date;
  // Legacy support
  shareEmail?: string;
  weather?: string;
  isLocked: boolean;
  photos: MediaFile[];
  videos: MediaFile[];
  // New shared capsule fields
  accessType?: "OWNER" | "SHARED";
  shareStatus?: string;
  sharedByEmail?: string;
  sharedWith?: Recipient[];
  canViewContent?: boolean;
  canManageShares?: boolean;
}

export interface CreateCapsuleInput {
  title: string;
  content: string;
  unlockAt: string;
  shareEmail?: string;
  recipients?: Recipient[];
  weather?: string;
  photos: MediaFile[];
  videos: MediaFile[];
  requireMedia?: boolean;
}

export type DashboardScope = "owned" | "shared" | "all";

interface CapsuleContextType {
  capsules: Capsule[];
  loading: boolean;
  scope: DashboardScope;
  setScope: (scope: DashboardScope) => void;
  fetchCapsules: (scope?: DashboardScope) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<MediaFile[]>;
  addCapsule: (capsule: CreateCapsuleInput) => Promise<boolean>;
  getCapsule: (id: string) => Capsule | undefined;
  unlockCapsule: (id: string) => void;
}

// Error handling map with code-specific behaviors
export const errorCodeMap: Record<string, { message: string; behavior: string }> = {
  SHARE_EMAIL_INVALID: {
    message: "One or more recipient emails are invalid. Please check and try again.",
    behavior: "highlight-invalid-recipients-block-submit",
  },
  SHARE_EMAIL_DUPLICATE: {
    message: "Some recipients are listed multiple times. Duplicates have been removed.",
    behavior: "show-warning-auto-focus-recipients",
  },
  SHARE_SELF_NOT_ALLOWED: {
    message: "You cannot share a capsule with your own email address.",
    behavior: "inline-error-remove-self",
  },
  SHARE_LIMIT_EXCEEDED: {
    message: "You can share with a maximum of 50 recipients.",
    behavior: "show-limit-prevent-submit",
  },
  INVALID_DASHBOARD_SCOPE: {
    message: "Dashboard scope is invalid. Showing all capsules.",
    behavior: "fallback-to-all-retry-once",
  },
  MEDIA_REQUIRED: {
    message: "Media upload required. Please add photos or videos before creating.",
    behavior: "focus-media-section-keep-form",
  },
  MEDIA_FILE_NOT_FOUND: {
    message: "Some uploaded media files were not found on the server. Please re-upload.",
    behavior: "ask-reupload-keep-form",
  },
  INVALID_REQUEST_PAYLOAD: {
    message: "Request validation failed. Please check all required fields.",
    behavior: "show-toast-keep-form",
  },
  INTERNAL_SERVER_ERROR: {
    message: "Server error occurred. Please try again.",
    behavior: "show-retry-cta-keep-draft",
  },
  FILE_SIZE_LIMIT_EXCEEDED: {
    message: "File size exceeds the 50MB limit. Please upload smaller files.",
    behavior: "show-near-upload-ui",
  },
};


const CapsuleContext = createContext<CapsuleContextType | null>(null);

const getCapsuleErrorMessage = (error: ApiRequestError, fallback: string): string => {
  if (error.code && errorCodeMap[error.code]) {
    return errorCodeMap[error.code].message;
  }
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
  const unlockAtValue = raw.unlockAt ?? raw.unlock_at ?? raw.openAt ?? raw.open_at;
  const unlockAtDate = new Date(unlockAtValue);
  const isLocked = unlockAtDate > new Date();
  
  return {
    ...raw,
    // handle both MongoDB _id and numeric/string id
    id: String(raw.id ?? raw._id ?? raw.capsuleId ?? ""),
    // handle camelCase and snake_case date fields
    createdAt: new Date(raw.createdAt ?? raw.created_at),
    unlockAt: unlockAtDate,
    isLocked,
    photos: raw.photos ?? [],
    videos: raw.videos ?? [],
    // New shared capsule fields - handle null content for locked
    content: raw.content ?? null,
    accessType: raw.accessType ?? "OWNER",
    shareStatus: raw.shareStatus ?? "",
    sharedByEmail: raw.sharedByEmail ?? undefined,
    sharedWith: raw.sharedWith ?? [],
    canViewContent: raw.canViewContent ?? true,
    canManageShares: raw.canManageShares ?? false,
  };
};

export const CapsuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, token, logout } = useAuth();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<DashboardScope>("owned");
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceBroadcastMapRef = useRef<Map<DashboardScope, NodeJS.Timeout>>(new Map());

  // Scope-specific cache
  const cacheRef = useRef<Map<DashboardScope, Capsule[]>>(new Map());

  const fetchCapsules = useCallback(async (requestedScope?: DashboardScope) => {
    const targetScope = requestedScope ?? scope;
    
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      // Build URL with scope parameter
      const url = targetScope === "all" ? "/capsules/dashboard?scope=all" : `/capsules/dashboard?scope=${targetScope}`;
      
      const listResult = await apiRequest<any[] | { capsules?: any[] }>(url, {
        signal: abortControllerRef.current.signal as any,
      });
      
      const list = Array.isArray(listResult) ? listResult : listResult?.capsules ?? [];
      const mapped = list.map(mapRaw);
      
      // Update cache for this scope
      cacheRef.current.set(targetScope, mapped);
      setCapsules(mapped);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }
      
      if (error instanceof ApiRequestError) {
        // Handle INVALID_DASHBOARD_SCOPE with fallback and one retry
        if (error.code === "INVALID_DASHBOARD_SCOPE" && targetScope !== "all") {
          toast.error("Invalid dashboard scope. Retrying with all capsules...");
          setScope("all");
          await fetchCapsules("all");
          return;
        }
        
        if (error.status === 401 || error.status === 403) {
          setCapsules([]);
          cacheRef.current.clear();
          logout();
          toast.error("Session expired. Please log in again.");
          return;
        }
        toast.error(error.message || "Failed to load capsules.");
      } else {
        toast.error("Network error. Could not load capsules.");
      }
    } finally {
      setLoading(false);
    }
  }, [scope, logout]);

  // Debounce scope changes to avoid rapid requests
  const debouncedScopeChange = useCallback((newScope: DashboardScope) => {
    setScope(newScope);
    
    // Clear existing debounce timer for this scope
    const existingTimer = debounceBroadcastMapRef.current.get(newScope);
    if (existingTimer) clearTimeout(existingTimer);
    
    const timer = setTimeout(() => {
      fetchCapsules(newScope);
    }, 150); // 150ms debounce
    
    debounceBroadcastMapRef.current.set(newScope, timer);
  }, [fetchCapsules]);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setCapsules([]);
      cacheRef.current.clear();
      setLoading(false);
      return;
    }

    fetchCapsules();
  }, [isLoggedIn, token, fetchCapsules]);

  useEffect(() => {
    // Cleanup debounce timers on unmount
    return () => {
      debounceBroadcastMapRef.current.forEach(timer => clearTimeout(timer));
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const addCapsule = useCallback(async (data: CreateCapsuleInput): Promise<boolean> => {
    try {
      console.log(`[addCapsule] Sending POST to /capsules/new with data:`, data);
      const response = await apiRequest<any>("/capsules/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(`[addCapsule] API response:`, response);
      
      const created = mapRaw(response);
      console.log(`[addCapsule] Mapped capsule:`, created);
      
      setCapsules((prev) => [created, ...prev]);
      // Also update cache
      cacheRef.current.forEach((_, key) => {
        cacheRef.current.set(key, [created, ...(cacheRef.current.get(key) ?? [])]);
      });
      console.log(`[addCapsule] Success! Capsule added to state`);
      return true;
    } catch (error) {
      console.error(`[addCapsule] Error caught:`, error);
      if (error instanceof ApiRequestError) {
        console.error(`[addCapsule] API Error details - Status: ${error.status}, Code: ${error.code}, Message: ${error.message}`);
        toast.error(getCapsuleErrorMessage(error, "Failed to create capsule."));
      } else {
        console.error(`[addCapsule] Non-API error:`, error);
        toast.error("Network error. Could not create capsule.");
      }
      return false;
    }
  }, []);

  const uploadFiles = useCallback(async (files: File[]): Promise<MediaFile[]> => {
    if (files.length === 0) return [];
    console.log(`[uploadFiles] Uploading ${files.length} file(s):`, files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const result = await apiRequest<MediaFile[]>("/capsules/upload", {
        method: "POST",
        body: formData,
      });
      console.log(`[uploadFiles] Upload successful:`, result);
      return result;
    } catch (error) {
      console.error(`[uploadFiles] Upload failed:`, error);
      if (error instanceof ApiRequestError) {
        console.error(`[uploadFiles] API Error - Status: ${error.status}, Code: ${error.code}, Message: ${error.message}`);
        toast.error(getCapsuleErrorMessage(error, "Failed to upload files."));
      } else {
        console.error(`[uploadFiles] Non-API error:`, error);
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
    <CapsuleContext.Provider value={{ capsules, loading, scope, setScope: debouncedScopeChange, fetchCapsules, uploadFiles, addCapsule, getCapsule, unlockCapsule }}>
      {children}
    </CapsuleContext.Provider>
  );
};

export const useCapsules = () => {
  const ctx = useContext(CapsuleContext);
  if (!ctx) throw new Error("useCapsules must be used within CapsuleProvider");
  return ctx;
};


