import { Auth, type AuthConfig } from "@auth/core";
import type { Session } from "@auth/core/types";
import { authConfig, getAuthSecret, IDLE_TIMEOUT_SECONDS } from "../../../lib/auth-config";
import type { APIRoute } from "astro";

const config: AuthConfig = {
  ...authConfig,
  secret: getAuthSecret(),
  trustHost: true,
  basePath: "/api/auth",
  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        token.id = user.id;
        token.lastActivity = now;
        return token;
      }
      const lastActivity = (token.lastActivity as number) || now;
      if (now - lastActivity > IDLE_TIMEOUT_SECONDS) {
        return {};
      }
      token.lastActivity = now;
      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        return {} as Session;
      }
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export const ALL: APIRoute = async ({ request }) => {
  return Auth(request, config);
};
