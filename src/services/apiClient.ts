import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // sends the refreshToken cookie
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try refreshing the access token once, then retry the original request
let isRefreshing = false;
let queue: Array<() => void> = [];

api.interceptors.response.use(
  (res) => {
    // Automatically unwrap standard enterprise backend response { success: true, data: ... }
    if (res.data && typeof res.data === "object" && res.data.success === true && "data" in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => queue.push(() => resolve(api(original))));
      }

      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh");
        useAuthStore.getState().setAccessToken(data.accessToken);
        queue.forEach((cb) => cb());
        queue = [];
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
