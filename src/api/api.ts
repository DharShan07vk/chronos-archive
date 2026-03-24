export const URI = import.meta.env.VITE_API_URI ?? "";

export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  body?: ApiEnvelope;

  constructor(status: number, message: string, code?: string, body?: ApiEnvelope) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export const getToken = (): string | null => localStorage.getItem("token");

const buildUrl = (path: string): string => `${URI}${path}`;

const safeJson = async (res: Response): Promise<unknown> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const unwrapData = <T>(body: unknown): T => {
  if (body && typeof body === "object" && "data" in body) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
};

export const authFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  return fetch(buildUrl(path), {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

export const apiRequest = async <T>(
  path: string,
  init: RequestInit = {},
  options: { withAuth?: boolean } = {}
): Promise<T> => {
  const { withAuth = true } = options;
  const token = getToken();
  const res = await fetch(buildUrl(path), {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await safeJson(res)) as ApiEnvelope<T> | null;
  const failedByContract = body?.success === false;

  if (!res.ok || failedByContract) {
    const message =
      body?.message ||
      (res.status >= 500 ? "Server error. Please try again." : "Request failed.");
    throw new ApiRequestError(res.status, message, body?.error, body ?? undefined);
  }

  return unwrapData<T>(body);
};