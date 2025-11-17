// client/src/stores/auth.ts
import { defineStore } from "pinia";
import { AUTH_BASE } from "@/config/auth";

interface MeResponse {
  authenticated: boolean;
  user_id?: string;
  email?: string;
  full_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
}

const BASE = AUTH_BASE || ""; // dev: "", prod: "https://api.mailtrace.ai"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    me: null as MeResponse | null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.me?.authenticated,
    userEmail: (state) => state.me?.email ?? null,
    userName: (state) =>
      state.me?.full_name || state.me?.email?.split("@")[0] || "User",
    userRole: (state) => state.me?.role ?? "",
    avatarUrl: (state) => state.me?.avatar_url || "",
  },

  actions: {
    async fetchMe() {
      this.loading = true;
      try {
        const res = await fetch(`${BASE}/auth/me`, {
          credentials: "include",
        });

        const ct = res.headers.get("content-type") || "";
        let data: MeResponse;

        if (ct.includes("application/json")) {
          data = (await res.json()) as MeResponse;
        } else {
          // If backend ever sends HTML (error page), don't explode
          console.error(
            "[auth] /auth/me returned non-JSON response; treating as unauthenticated"
          );
          data = { authenticated: false };
        }

        this.me = data;
      } catch (err) {
        console.error("[auth] /auth/me failed", err);
        this.me = { authenticated: false };
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },

    // Optional: set avatar by URL only (no file upload)
    async updateAvatarUrl(avatarUrl: string) {
      try {
        const res = await fetch(`${BASE}/auth/me/avatar`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar_url: avatarUrl }),
        });

        if (!res.ok) {
          console.error(
            "[auth] failed to update avatar_url",
            await res.text()
          );
          return;
        }

        await this.fetchMe();
      } catch (err) {
        console.error("[auth] error updating avatar_url", err);
      }
    },

    // File upload → backend saves file → returns URL → we refresh /auth/me
    async uploadAvatar(file: File) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const res = await fetch(`${BASE}/auth/me/avatar-upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          console.error(
            "[auth] avatar upload failed",
            await res.text()
          );
          return;
        }

        await this.fetchMe();
      } catch (err) {
        console.error("[auth] error uploading avatar", err);
      }
    },
  },
});
