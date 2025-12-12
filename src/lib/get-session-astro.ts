import { Auth, type AuthConfig } from "@auth/core";
import type { Session as AuthSession } from "@auth/core/types";
import { authConfig, getAuthSecret, IDLE_TIMEOUT_SECONDS } from "./auth-config";

interface Session {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
  expires: string;
}

export async function getSession(request: Request): Promise<Session | null> {
  const cookieName = process.env.NODE_ENV === "production" 
    ? "__Secure-authjs.session-token" 
    : "authjs.session-token";
  
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies
    .split(";")
    .find(c => c.trim().startsWith(`${cookieName}=`))
    ?.split("=")[1];

  if (!sessionToken) {
    return null;
  }

  try {
    const sessionUrl = new URL("/api/auth/session", request.url);
    const sessionRequest = new Request(sessionUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

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
            return {} as AuthSession;
          }
          if (session.user && token.id) {
            (session.user as { id?: string }).id = token.id as string;
          }
          return session;
        },
      },
    };

    const response = await Auth(sessionRequest, config);
    
    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    
    if (!session?.user?.id) {
      return null;
    }

    return session as Session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export async function requireAuth(request: Request, redirectTo = "/login") {
  const session = await getSession(request);
  if (!session) {
    return { redirect: redirectTo, session: null };
  }
  return { redirect: null, session };
}
