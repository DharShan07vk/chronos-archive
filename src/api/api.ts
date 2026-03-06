export const URI = import.meta.env.VITE_API_URI;;

export const getToken = (): string | null => localStorage.getItem("token");


export const authFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  console.log(`[authFetch] Making request to ${URI + path} with token:`, token); 
  return fetch(URI + path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};